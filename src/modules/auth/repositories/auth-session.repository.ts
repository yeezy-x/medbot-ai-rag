import { BaseRepository } from "@/core/repositories/base.repository";

export class AuthSessionRepository extends BaseRepository {
  async create(data: {
    jti: string;
    userId: string;
    sessionTokenHash?: string | null;
    userAgent?: string | null;
    ipAddress?: string | null;
    deviceLabel?: string | null;
    location?: string | null;
    expiresAt: Date;
  }) {
    return this.db.authSession.create({
      data: {
        jti: data.jti,
        userId: data.userId,
        sessionTokenHash: data.sessionTokenHash ?? null,
        userAgent: data.userAgent ?? null,
        ipAddress: data.ipAddress ?? null,
        deviceLabel: data.deviceLabel ?? null,
        location: data.location ?? null,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByJti(jti: string) {
    return this.db.authSession.findUnique({ where: { jti } });
  }

  async listActiveForUser(userId: string) {
    return this.db.authSession.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: "desc" },
    });
  }

  async touch(jti: string, lastActiveAt = new Date()) {
    return this.db.authSession.update({
      where: { jti },
      data: { lastActiveAt },
    });
  }

  async revokeByJti(jti: string, userId?: string) {
    return this.db.authSession.updateMany({
      where: {
        jti,
        ...(userId ? { userId } : {}),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async revokeById(id: string, userId: string) {
    return this.db.authSession.updateMany({
      where: { id, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string, exceptJti?: string) {
    return this.db.authSession.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptJti ? { jti: { not: exceptJti } } : {}),
      },
      data: { revokedAt: new Date() },
    });
  }
}
