import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { randomBytes } from "crypto";

import { BaseService } from "@/core/services/base.service";
import { UserRepository } from "@/modules/user/repositories";
import { ValidationError } from "@/lib/errors/validation-error";
import { decryptSecret, encryptSecret } from "../utils/crypto";
import { generateRawToken, hashToken, safeEqual } from "../utils/tokens";
import {
  MFA_ISSUER,
  RECOVERY_CODE_COUNT,
  TRUSTED_DEVICE_TTL_MS,
} from "../constants/auth.constants";
import { RecoveryCodeRepository } from "../repositories/recovery-code.repository";
import { TrustedDeviceRepository } from "../repositories/trusted-device.repository";
import { auditService } from "./audit.service";
import { rateLimitService } from "./rate-limit.service";
import { emailService } from "@/modules/email";
import { parseDeviceLabel } from "../utils/device";

function formatRecoveryCode(): string {
  const raw = randomBytes(5).toString("hex").toUpperCase();
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
}

export class MfaService extends BaseService {
  private userRepository = new UserRepository();
  private recoveryCodes = new RecoveryCodeRepository();
  private trustedDevices = new TrustedDeviceRepository();

  async beginSetup(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new ValidationError("User not found");

    const secret = generateSecret();
    const encrypted = encryptSecret(secret);
    await this.userRepository.updateMfa(userId, {
      mfaSecretEnc: encrypted,
      mfaEnabled: false,
    });

    const otpauth = generateURI({
      issuer: MFA_ISSUER,
      label: user.email,
      secret,
    });
    const qrDataUrl = await QRCode.toDataURL(otpauth);
    await auditService.log("MFA_SETUP_STARTED", { userId });

    return { secret, otpauth, qrDataUrl };
  }

  async confirmSetup(userId: string, code: string) {
    const user = await this.userRepository.findById(userId);
    if (!user?.mfaSecretEnc) {
      throw new ValidationError("MFA setup not started");
    }

    const plain = decryptSecret(user.mfaSecretEnc);
    const result = await verify({ token: code, secret: plain });
    if (!result.valid) {
      throw new ValidationError("Invalid MFA code");
    }

    const codes = await this.generateRecoveryCodes(userId);
    await this.userRepository.updateMfa(userId, { mfaEnabled: true });
    await auditService.log("MFA_ENABLED", { userId });
    void emailService
      .sendMfaEnabled(user.email, user.name)
      .catch(() => undefined);

    return { enabled: true, recoveryCodes: codes };
  }

  async generateRecoveryCodes(userId: string): Promise<string[]> {
    const plainCodes = Array.from({ length: RECOVERY_CODE_COUNT }, () =>
      formatRecoveryCode()
    );
    await this.recoveryCodes.deleteAllForUser(userId);
    await this.recoveryCodes.createMany(
      userId,
      plainCodes.map((c) => hashToken(c))
    );
    await auditService.log("RECOVERY_CODES_REGENERATED", { userId });
    return plainCodes;
  }

  async verifyCode(userId: string, code: string): Promise<boolean> {
    rateLimitService.checkMfa(userId);
    const user = await this.userRepository.findById(userId);
    if (!user?.mfaEnabled || !user.mfaSecretEnc) {
      return false;
    }

    const normalized = code.trim().replace(/\s+/g, "");

    // Recovery code path (contains hyphen or longer than 6)
    if (normalized.length > 6) {
      const unused = await this.recoveryCodes.findUnused(userId);
      const hashed = hashToken(normalized.toUpperCase());
      for (const row of unused) {
        if (safeEqual(row.codeHash, hashed)) {
          await this.recoveryCodes.markUsed(row.id);
          await auditService.log("MFA_CHALLENGE_SUCCESS", {
            userId,
            meta: { method: "recovery" },
          });
          return true;
        }
      }
      await auditService.log("MFA_CHALLENGE_FAILURE", {
        userId,
        meta: { method: "recovery" },
      });
      return false;
    }

    const plain = decryptSecret(user.mfaSecretEnc);
    const result = await verify({ token: normalized, secret: plain });
    if (result.valid) {
      await auditService.log("MFA_CHALLENGE_SUCCESS", {
        userId,
        meta: { method: "totp" },
      });
      return true;
    }
    await auditService.log("MFA_CHALLENGE_FAILURE", {
      userId,
      meta: { method: "totp" },
    });
    return false;
  }

  async disable(userId: string, code: string) {
    const ok = await this.verifyCode(userId, code);
    if (!ok) throw new ValidationError("Invalid MFA code");

    const user = await this.userRepository.findById(userId);
    await this.userRepository.updateMfa(userId, {
      mfaEnabled: false,
      mfaSecretEnc: null,
    });
    await this.recoveryCodes.deleteAllForUser(userId);
    await this.trustedDevices.deleteAllForUser(userId);
    await auditService.log("MFA_DISABLED", { userId });
    if (user) {
      void emailService
        .sendMfaDisabled(user.email, user.name)
        .catch(() => undefined);
    }
    return { enabled: false };
  }

  async getStatus(userId: string) {
    const user = await this.userRepository.findById(userId);
    const remaining = user
      ? await this.recoveryCodes.countUnused(userId)
      : 0;
    return {
      mfaEnabled: user?.mfaEnabled ?? false,
      recoveryCodesRemaining: remaining,
    };
  }

  async trustDevice(userId: string, userAgent?: string | null) {
    const raw = generateRawToken(32);
    const expiresAt = new Date(Date.now() + TRUSTED_DEVICE_TTL_MS);
    await this.trustedDevices.create({
      userId,
      tokenHash: hashToken(raw),
      userAgent,
      expiresAt,
    });
    const user = await this.userRepository.findById(userId);
    if (user) {
      void emailService
        .sendNewDevice(user.email, user.name, parseDeviceLabel(userAgent))
        .catch(() => undefined);
    }
    return { token: raw, expiresAt };
  }

  async isTrustedDevice(userId: string, rawToken?: string | null) {
    if (!rawToken) return false;
    const row = await this.trustedDevices.findValid(
      userId,
      hashToken(rawToken)
    );
    if (!row) return false;
    await this.trustedDevices.touch(row.id);
    return true;
  }
}

export const mfaService = new MfaService();
