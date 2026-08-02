import { BaseService } from "@/core/services/base.service";
import { prisma } from "@/db";
import { UserRepository } from "@/modules/user/repositories";
import { ValidationError } from "@/lib/errors/validation-error";
import { hashPassword, verifyPassword } from "../utils/password";
import { auditService } from "./audit.service";
import { emailService } from "@/modules/email";
import { AuthSessionRepository } from "../repositories/auth-session.repository";

export class AccountLinkService extends BaseService {
  private users = new UserRepository();
  private sessions = new AuthSessionRepository();

  async listLinkedProviders(userId: string) {
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: { provider: true, type: true, providerAccountId: true },
    });
    const user = await this.users.findById(userId);
    return {
      hasPassword: Boolean(user?.passwordHash),
      providers: accounts.map((a) => a.provider),
    };
  }

  async setPassword(
    userId: string,
    password: string,
    currentPassword?: string
  ) {
    const user = await this.users.findById(userId);
    if (!user) throw new ValidationError("User not found");

    if (user.passwordHash) {
      if (!currentPassword) {
        throw new ValidationError("Current password required");
      }
      const { valid } = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) throw new ValidationError("Current password is incorrect");
    }

    const passwordHash = await hashPassword(password);
    await this.users.updatePassword(userId, passwordHash);
    await this.sessions.revokeAllForUser(userId);
    await this.users.bumpTokenVersion(userId);
    await auditService.log("PASSWORD_CHANGED", { userId });
    void emailService
      .sendPasswordChanged(user.email, user.name)
      .catch(() => undefined);
    return { updated: true };
  }

  async unlinkProvider(userId: string, provider: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new ValidationError("User not found");

    const accounts = await prisma.account.findMany({ where: { userId } });
    const remaining = accounts.filter((a) => a.provider !== provider);
    if (!user.passwordHash && remaining.length === 0) {
      throw new ValidationError(
        "Cannot unlink the only sign-in method. Set a password first."
      );
    }

    await prisma.account.deleteMany({ where: { userId, provider } });
    await auditService.log("ACCOUNT_UNLINKED", {
      userId,
      meta: { provider },
    });
    return { unlinked: true };
  }

  /** Called from Auth.js signIn when Google asserts a verified email. */
  async ensureGoogleLink(params: {
    email: string;
    name?: string | null;
    image?: string | null;
    providerAccountId: string;
    access_token?: string | null;
    refresh_token?: string | null;
    expires_at?: number | null;
    id_token?: string | null;
    scope?: string | null;
    token_type?: string | null;
  }) {
    const email = params.email.trim().toLowerCase();
    let user = await this.users.findByEmail(email);

    if (!user) {
      user = await this.users.create({
        name: params.name?.trim() || email.split("@")[0] || "User",
        email,
        passwordHash: null,
        emailVerified: new Date(),
        role: "USER",
      });
      if (params.image) {
        await this.users.updateProfile(user.id, { image: params.image });
      }
    } else if (!user.emailVerified) {
      await this.users.setEmailVerified(user.id);
    }

    if (user.status !== "ACTIVE") {
      throw new ValidationError("Account unavailable");
    }

    const existing = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: params.providerAccountId,
        },
      },
    });

    if (!existing) {
      await prisma.account.create({
        data: {
          userId: user.id,
          type: "oauth",
          provider: "google",
          providerAccountId: params.providerAccountId,
          access_token: params.access_token ?? null,
          refresh_token: params.refresh_token ?? null,
          expires_at: params.expires_at ?? null,
          id_token: params.id_token ?? null,
          scope: params.scope ?? null,
          token_type: params.token_type ?? null,
        },
      });
      await auditService.log("ACCOUNT_LINKED", {
        userId: user.id,
        meta: { provider: "google" },
      });
      void emailService
        .sendAccountLinked(user.email, user.name, "Google")
        .catch(() => undefined);
    }

    return user;
  }
}

export const accountLinkService = new AccountLinkService();
