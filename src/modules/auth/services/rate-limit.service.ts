import { BaseService } from "@/core/services/base.service";
import {
  RATE_LIMIT_LOGIN_MAX,
  RATE_LIMIT_MFA_MAX,
  RATE_LIMIT_RESET_MAX,
  RATE_LIMIT_VERIFY_MAX,
  RATE_LIMIT_WINDOW_MS,
} from "../constants/auth.constants";
import { ValidationError } from "@/lib/errors/validation-error";

type Bucket = { count: number; resetAt: number };

/**
 * In-process sliding window rate limiter.
 * Suitable for single-instance / Fluid Compute sticky behavior;
 * counters also backed by User.failedLoginCount for lockout.
 */
export class RateLimitService extends BaseService {
  private buckets = new Map<string, Bucket>();

  private check(key: string, max: number, windowMs: number) {
    const now = Date.now();
    const current = this.buckets.get(key);
    if (!current || current.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }
    if (current.count >= max) {
      throw new ValidationError(
        "Too many attempts. Please try again later."
      );
    }
    current.count += 1;
  }

  checkLogin(identifier: string) {
    this.check(`login:${identifier}`, RATE_LIMIT_LOGIN_MAX, RATE_LIMIT_WINDOW_MS);
  }

  checkPasswordReset(identifier: string) {
    this.check(`reset:${identifier}`, RATE_LIMIT_RESET_MAX, RATE_LIMIT_WINDOW_MS);
  }

  checkVerification(identifier: string) {
    this.check(`verify:${identifier}`, RATE_LIMIT_VERIFY_MAX, RATE_LIMIT_WINDOW_MS);
  }

  checkMfa(identifier: string) {
    this.check(`mfa:${identifier}`, RATE_LIMIT_MFA_MAX, RATE_LIMIT_WINDOW_MS);
  }
}

export const rateLimitService = new RateLimitService();
