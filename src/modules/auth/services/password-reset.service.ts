import { BaseService } from "@/core/services/base.service";
import { RESET_TOKEN_TTL_MS } from "../constants/auth.constants";
import { getAppBaseUrl, env } from "@/config/env";
import { emailService } from "@/modules/email";
import { hashPassword } from "../utils/password";
import { generateRawToken, hashToken } from "../utils/tokens";
import { ValidationError } from "@/lib/errors/validation-error";
import { UserRepository } from "@/modules/user/repositories";
import { AuthTokenRepository } from "../repositories/auth-token.repository";
import { AuthSessionRepository } from "../repositories/auth-session.repository";
import { rateLimitService } from "./rate-limit.service";
import { auditService } from "./audit.service";

export class PasswordResetService extends BaseService {
  private users = new UserRepository();
  private tokens = new AuthTokenRepository();
  private sessions = new AuthSessionRepository();

  async requestReset(emailInput: string) {
    const email = emailInput.trim().toLowerCase();
    rateLimitService.checkPasswordReset(email);

    const generic = {
      message:
        "If an account exists for that email, reset instructions have been sent.",
    };

    const user = await this.users.findByEmail(email);
    if (!user?.passwordHash) {
      return generic;
    }

    await this.tokens.deleteUnconsumed("PASSWORD_RESET", email);
    const rawToken = generateRawToken();
    await this.tokens.create({
      userId: user.id,
      type: "PASSWORD_RESET",
      identifier: email,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const resetUrl = `${getAppBaseUrl()}/login/reset?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email)}`;

    try {
      await emailService.sendPasswordReset(email, resetUrl);
    } catch (error) {
      this.logger.error({ event: "PASSWORD_RESET_EMAIL_FAILED", error });
      if (env.NODE_ENV === "development") {
        return { ...generic, devResetUrl: resetUrl };
      }
      throw error;
    }

    await auditService.log("PASSWORD_RESET_REQUESTED", { userId: user.id });

    if (env.NODE_ENV === "development" && !process.env.AUTH_RESEND_KEY) {
      return { ...generic, devResetUrl: resetUrl };
    }

    return generic;
  }

  async resetPassword(input: {
    email: string;
    token: string;
    password: string;
  }) {
    const email = input.email.trim().toLowerCase();
    const record = await this.tokens.findValid(
      "PASSWORD_RESET",
      email,
      hashToken(input.token)
    );

    if (!record) {
      throw new ValidationError("Reset link is invalid or has expired");
    }

    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new ValidationError("Reset link is invalid or has expired");
    }

    const passwordHash = await hashPassword(input.password);
    await this.users.updatePassword(user.id, passwordHash);
    await this.tokens.consume(record.id);
    await this.sessions.revokeAllForUser(user.id);
    await this.users.bumpTokenVersion(user.id);

    await auditService.log("PASSWORD_RESET_COMPLETED", { userId: user.id });
    void emailService
      .sendPasswordChanged(user.email, user.name)
      .catch(() => undefined);

    return { reset: true };
  }
}

export const passwordResetService = new PasswordResetService();
