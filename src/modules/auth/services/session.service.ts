import { BaseService } from "@/core/services/base.service";
import {
  SESSION_ACTIVITY_THROTTLE_MS,
  SESSION_MAX_AGE_SEC,
} from "../constants/auth.constants";
import { AuthSessionRepository } from "../repositories/auth-session.repository";
import { UserRepository } from "@/modules/user/repositories";
import { ValidationError } from "@/lib/errors/validation-error";
import { auditService } from "./audit.service";
import { ForbiddenError } from "@/lib/errors/forbidden-error";

export class SessionService extends BaseService {
  private sessions = new AuthSessionRepository();
  private users = new UserRepository();

  async assertValid(jti: string | undefined, userId: string, tokenVersion?: number) {
    if (!jti) {
      throw new ForbiddenError("Session invalid");
    }

    const session = await this.sessions.findByJti(jti);
    if (
      !session ||
      session.userId !== userId ||
      session.revokedAt ||
      session.expiresAt < new Date()
    ) {
      throw new ForbiddenError("Session expired or revoked");
    }

    if (typeof tokenVersion === "number") {
      const user = await this.users.findById(userId);
      if (!user || user.tokenVersion !== tokenVersion) {
        throw new ForbiddenError("Session invalidated");
      }
      if (user.status !== "ACTIVE") {
        throw new ForbiddenError("Account unavailable");
      }
    }

    const age = Date.now() - session.lastActiveAt.getTime();
    if (age > SESSION_ACTIVITY_THROTTLE_MS) {
      await this.sessions.touch(jti).catch(() => undefined);
    }

    return session;
  }

  async isJtiActive(jti: string | undefined, userId: string, tokenVersion?: number) {
    try {
      await this.assertValid(jti, userId, tokenVersion);
      return true;
    } catch {
      return false;
    }
  }

  async listForUser(userId: string, currentJti?: string) {
    const rows = await this.sessions.listActiveForUser(userId);
    return rows.map((s) => ({
      id: s.id,
      deviceLabel: s.deviceLabel,
      ipAddress: s.ipAddress,
      location: s.location,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      expiresAt: s.expiresAt,
      current: s.jti === currentJti,
    }));
  }

  async revokeOne(userId: string, sessionId: string) {
    const result = await this.sessions.revokeById(sessionId, userId);
    if (result.count === 0) {
      throw new ValidationError("Session not found");
    }
    await auditService.log("SESSION_REVOKED", {
      userId,
      meta: { sessionId },
    });
    return { revoked: true };
  }

  async revokeCurrent(jti: string | undefined, userId: string) {
    if (!jti) return { revoked: false };
    await this.sessions.revokeByJti(jti, userId);
    await auditService.log("LOGOUT", { userId, meta: { jti } });
    return { revoked: true };
  }

  async revokeAll(userId: string, exceptJti?: string) {
    await this.sessions.revokeAllForUser(userId, exceptJti);
    await this.users.bumpTokenVersion(userId);
    await auditService.log("LOGOUT_ALL", { userId });
    return { revoked: true };
  }

  async rotate(
    userId: string,
    oldJti: string | undefined,
    meta: { ip?: string | null; userAgent?: string | null } = {}
  ) {
    if (oldJti) {
      await this.sessions.revokeByJti(oldJti, userId);
    }
    const { randomUUID } = await import("crypto");
    const { parseDeviceLabel } = await import("../utils/device");
    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000);
    await this.sessions.create({
      jti,
      userId,
      userAgent: meta.userAgent,
      ipAddress: meta.ip,
      deviceLabel: parseDeviceLabel(meta.userAgent),
      expiresAt,
    });
    return jti;
  }
}

export const sessionService = new SessionService();
