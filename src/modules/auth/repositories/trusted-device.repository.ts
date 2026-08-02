import { BaseRepository } from "@/core/repositories/base.repository";

export class TrustedDeviceRepository extends BaseRepository {
  async create(data: {
    userId: string;
    tokenHash: string;
    userAgent?: string | null;
    expiresAt: Date;
  }) {
    return this.db.trustedDevice.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        userAgent: data.userAgent ?? null,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findValid(userId: string, tokenHash: string) {
    return this.db.trustedDevice.findFirst({
      where: {
        userId,
        tokenHash,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async touch(id: string) {
    return this.db.trustedDevice.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }

  async deleteAllForUser(userId: string) {
    return this.db.trustedDevice.deleteMany({ where: { userId } });
  }

  async deleteById(id: string, userId: string) {
    return this.db.trustedDevice.deleteMany({ where: { id, userId } });
  }
}
