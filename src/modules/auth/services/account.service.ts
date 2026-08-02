import { BaseService } from "@/core/services/base.service";
import { EMAIL_CHANGE_TOKEN_TTL_MS } from "../constants/auth.constants";
import { getAppBaseUrl } from "@/config/env";
import { emailService } from "@/modules/email";
import { UserRepository } from "@/modules/user/repositories";
import { AuthTokenRepository } from "../repositories/auth-token.repository";
import { AuthSessionRepository } from "../repositories/auth-session.repository";
import { generateRawToken, hashToken } from "../utils/tokens";
import { verifyPassword } from "../utils/password";
import { ValidationError } from "@/lib/errors/validation-error";
import { auditService } from "./audit.service";
import { prisma } from "@/db";
import { accountLinkService } from "./account-link.service";

export class AccountService extends BaseService {
  private users = new UserRepository();
  private tokens = new AuthTokenRepository();
  private sessions = new AuthSessionRepository();

  async updateProfile(
    userId: string,
    data: { name?: string; image?: string | null }
  ) {
    const user = await this.users.updateProfile(userId, data);
    await auditService.log("PROFILE_UPDATED", { userId });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    };
  }

  async changePassword(
    userId: string,
    input: {
      currentPassword: string;
      password: string;
    }
  ) {
    return accountLinkService.setPassword(
      userId,
      input.password,
      input.currentPassword
    );
  }

  async requestEmailChange(
    userId: string,
    newEmailInput: string,
    password: string
  ) {
    const user = await this.users.findById(userId);
    if (!user?.passwordHash) {
      throw new ValidationError("Password required to change email");
    }
    const { valid } = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new ValidationError("Invalid password");

    const newEmail = newEmailInput.trim().toLowerCase();
    if (newEmail === user.email) {
      throw new ValidationError("Email is unchanged");
    }
    if (await this.users.exists(newEmail)) {
      throw new ValidationError("Email already in use");
    }

    await this.tokens.deleteUnconsumed("EMAIL_CHANGE", newEmail);
    const raw = generateRawToken();
    await this.tokens.create({
      userId,
      type: "EMAIL_CHANGE",
      identifier: newEmail,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + EMAIL_CHANGE_TOKEN_TTL_MS),
      meta: { previousEmail: user.email },
    });

    const verifyUrl = `${getAppBaseUrl()}/settings/security?emailChangeToken=${encodeURIComponent(raw)}&email=${encodeURIComponent(newEmail)}`;
    await emailService.sendVerification(newEmail, user.name, verifyUrl);
    return { sent: true };
  }

  async confirmEmailChange(newEmailInput: string, rawToken: string) {
    const newEmail = newEmailInput.trim().toLowerCase();
    const record = await this.tokens.findValid(
      "EMAIL_CHANGE",
      newEmail,
      hashToken(rawToken)
    );
    if (!record?.userId) {
      throw new ValidationError("Email change link is invalid or has expired");
    }

    const user = await this.users.findById(record.userId);
    if (!user) throw new ValidationError("User not found");

    const oldEmail = user.email;
    await this.users.updateEmail(user.id, newEmail);
    await this.tokens.consume(record.id);
    await auditService.log("EMAIL_CHANGED", {
      userId: user.id,
      meta: { from: oldEmail, to: newEmail },
    });
    void emailService
      .sendEmailChanged(oldEmail, user.name, newEmail)
      .catch(() => undefined);
    return { changed: true, email: newEmail };
  }

  async deactivate(userId: string, password: string) {
    const user = await this.users.findById(userId);
    if (!user?.passwordHash) {
      throw new ValidationError("Password confirmation required");
    }
    const { valid } = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new ValidationError("Invalid password");

    await this.users.setStatus(userId, "DEACTIVATED");
    await this.sessions.revokeAllForUser(userId);
    await this.users.bumpTokenVersion(userId);
    await auditService.log("ACCOUNT_DEACTIVATED", { userId });
    return { deactivated: true };
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new ValidationError("User not found");

    if (user.passwordHash) {
      const { valid } = await verifyPassword(password, user.passwordHash);
      if (!valid) throw new ValidationError("Invalid password");
    }

    await this.users.setStatus(userId, "PENDING_DELETION");
    await this.sessions.revokeAllForUser(userId);
    await this.users.bumpTokenVersion(userId);
    // Hard delete cascades chat sessions via FK when we delete the user
    await this.users.deleteUser(userId);
    await auditService.log("ACCOUNT_DELETED", {
      userId: null,
      meta: { deletedUserId: userId, email: user.email },
    });
    return { deleted: true };
  }

  async exportAccount(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new ValidationError("User not found");

    const [sessions, accounts, chats] = await Promise.all([
      this.sessions.listActiveForUser(userId),
      prisma.account.findMany({
        where: { userId },
        select: { provider: true, type: true },
      }),
      prisma.chatSession.findMany({
        where: { userId },
        select: { id: true, title: true, createdAt: true, updatedAt: true },
      }),
    ]);

    await auditService.log("ACCOUNT_EXPORTED", { userId });

    return {
      exportedAt: new Date().toISOString(),
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
      },
      providers: accounts.map((a) => a.provider),
      sessions: sessions.map((s) => ({
        id: s.id,
        deviceLabel: s.deviceLabel,
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
        lastActiveAt: s.lastActiveAt,
      })),
      chats,
    };
  }
}

export const accountService = new AccountService();
