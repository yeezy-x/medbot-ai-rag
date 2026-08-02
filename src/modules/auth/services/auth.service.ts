import { randomUUID } from "crypto";

import { BaseService } from "@/core/services/base.service";
import {
  LOCKOUT_DURATION_MS,
  LOCKOUT_MAX_ATTEMPTS,
  SESSION_MAX_AGE_SEC,
} from "../constants/auth.constants";
import { EmailAlreadyExistsError } from "../errors/email-already-exists.error";
import { ValidationError } from "@/lib/errors/validation-error";
import { UserRepository } from "@/modules/user/repositories";
import { hashPassword, verifyPassword } from "../utils/password";
import { parseDeviceLabel } from "../utils/device";
import type { LoginDto, RegisterDto, RequestMeta } from "../types/auth.dto";
import type { UserRole } from "@/types/auth.types";
import { AuthSessionRepository } from "../repositories/auth-session.repository";
import { auditService } from "./audit.service";
import { rateLimitService } from "./rate-limit.service";
import { emailService } from "@/modules/email";
import { getAppBaseUrl } from "@/config/env";

export type AuthUserPayload = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  mfaVerified: boolean;
  sessionId: string;
  tokenVersion: number;
  authTime: number;
};

export class AuthService extends BaseService {
  private userRepository = new UserRepository();
  private sessionRepository = new AuthSessionRepository();

  async register(input: RegisterDto, meta: RequestMeta = {}) {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.userRepository.exists(email);

    if (existingUser) {
      throw new EmailAlreadyExistsError();
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.userRepository.create({
      name: input.name.trim(),
      email,
      passwordHash,
      role: "USER",
      emailVerified: null,
      status: "ACTIVE",
    });

    this.logger.info({ event: "USER_REGISTERED", userId: user.id });
    await auditService.log("REGISTER", {
      userId: user.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return user;
  }

  async login(
    input: LoginDto,
    meta: RequestMeta = {}
  ): Promise<AuthUserPayload> {
    const email = input.email.trim().toLowerCase();
    rateLimitService.checkLogin(email);

    const user = await this.userRepository.findByEmail(email);

    // Timing-safe-ish: always do a verify when possible; generic error otherwise
    if (!user || !user.passwordHash) {
      await auditService.log("LOGIN_FAILURE", {
        ip: meta.ip,
        userAgent: meta.userAgent,
        meta: { email },
      });
      throw new ValidationError("Invalid credentials");
    }

    if (user.status === "DEACTIVATED" || user.status === "PENDING_DELETION") {
      throw new ValidationError("Invalid credentials");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ValidationError(
        "Account temporarily locked. Try again later."
      );
    }

    const { valid, needsRehash } = await verifyPassword(
      input.password,
      user.passwordHash
    );

    if (!valid) {
      const attempts = user.failedLoginCount + 1;
      const lockedUntil =
        attempts >= LOCKOUT_MAX_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_DURATION_MS)
          : null;
      await this.userRepository.recordFailedLogin(user.id, lockedUntil);
      await auditService.log("LOGIN_FAILURE", {
        userId: user.id,
        ip: meta.ip,
        userAgent: meta.userAgent,
      });
      throw new ValidationError("Invalid credentials");
    }

    if (needsRehash) {
      const newHash = await hashPassword(input.password);
      await this.userRepository.updatePassword(user.id, newHash);
    } else {
      await this.userRepository.resetFailedLogin(user.id);
    }

    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000);
    const deviceLabel = parseDeviceLabel(meta.userAgent);

    await this.sessionRepository.create({
      jti,
      userId: user.id,
      userAgent: meta.userAgent,
      ipAddress: meta.ip,
      deviceLabel,
      expiresAt,
    });

    await auditService.log("LOGIN_SUCCESS", {
      userId: user.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
      meta: { jti },
    });

    // Fire-and-forget new login email (don't block auth)
    void emailService
      .sendNewLogin(user.email, user.name, {
        deviceLabel,
        ip: meta.ip ?? undefined,
      })
      .catch(() => undefined);

    this.logger.info({ event: "USER_LOGGED_IN", userId: user.id, jti });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      mfaVerified: !user.mfaEnabled,
      // Use sessionId — Auth.js treats `jti` as a reserved JWT claim on User.
      sessionId: jti,
      tokenVersion: user.tokenVersion,
      authTime: Math.floor(Date.now() / 1000),
    };
  }

  async createOAuthSession(
    userId: string,
    meta: RequestMeta = {}
  ): Promise<{ jti: string; tokenVersion: number; authTime: number }> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.status !== "ACTIVE") {
      throw new ValidationError("Account unavailable");
    }

    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000);
    await this.sessionRepository.create({
      jti,
      userId,
      userAgent: meta.userAgent,
      ipAddress: meta.ip,
      deviceLabel: parseDeviceLabel(meta.userAgent),
      expiresAt,
    });

    return {
      jti,
      tokenVersion: user.tokenVersion,
      authTime: Math.floor(Date.now() / 1000),
    };
  }

  getVerifyUrl(email: string, token: string) {
    return `${getAppBaseUrl()}/login/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  }
}

export const authService = new AuthService();
