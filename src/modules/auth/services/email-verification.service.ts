import { BaseService } from "@/core/services/base.service";
import { VERIFY_TOKEN_TTL_MS } from "../constants/auth.constants";
import { getAppBaseUrl } from "@/config/env";
import { emailService } from "@/modules/email";
import { UserRepository } from "@/modules/user/repositories";
import { AuthTokenRepository } from "../repositories/auth-token.repository";
import { generateRawToken, hashToken } from "../utils/tokens";
import { ValidationError } from "@/lib/errors/validation-error";
import { rateLimitService } from "./rate-limit.service";
import { auditService } from "./audit.service";

export class EmailVerificationService extends BaseService {
  private users = new UserRepository();
  private tokens = new AuthTokenRepository();

  async sendVerification(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new ValidationError("User not found");
    if (user.emailVerified) {
      return { alreadyVerified: true as const };
    }

    rateLimitService.checkVerification(user.email);
    await this.tokens.deleteUnconsumed("EMAIL_VERIFY", user.email);

    const raw = generateRawToken();
    await this.tokens.create({
      userId: user.id,
      type: "EMAIL_VERIFY",
      identifier: user.email,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + VERIFY_TOKEN_TTL_MS),
    });

    const verifyUrl = `${getAppBaseUrl()}/login/verify?token=${encodeURIComponent(raw)}&email=${encodeURIComponent(user.email)}`;
    await emailService.sendVerification(user.email, user.name, verifyUrl);
    await auditService.log("EMAIL_VERIFICATION_SENT", { userId: user.id });

    return {
      sent: true as const,
      ...(process.env.NODE_ENV === "development" ? { devVerifyUrl: verifyUrl } : {}),
    };
  }

  async sendVerificationByEmail(emailInput: string) {
    const email = emailInput.trim().toLowerCase();
    rateLimitService.checkVerification(email);
    const user = await this.users.findByEmail(email);
    const generic = {
      message:
        "If an account exists for that email, verification instructions have been sent.",
    };
    if (!user || user.emailVerified) return generic;
    await this.sendVerification(user.id);
    return generic;
  }

  async verify(emailInput: string, rawToken: string) {
    const email = emailInput.trim().toLowerCase();
    const record = await this.tokens.findValid(
      "EMAIL_VERIFY",
      email,
      hashToken(rawToken)
    );
    if (!record) {
      throw new ValidationError("Verification link is invalid or has expired");
    }

    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new ValidationError("Verification link is invalid or has expired");
    }

    await this.users.setEmailVerified(user.id);
    await this.tokens.consume(record.id);
    await auditService.log("EMAIL_VERIFIED", { userId: user.id });
    return { verified: true };
  }
}

export const emailVerificationService = new EmailVerificationService();
