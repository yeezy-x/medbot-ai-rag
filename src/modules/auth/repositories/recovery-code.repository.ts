import { BaseRepository } from "@/core/repositories/base.repository";

export class RecoveryCodeRepository extends BaseRepository {
  async deleteAllForUser(userId: string) {
    return this.db.recoveryCode.deleteMany({ where: { userId } });
  }

  async createMany(userId: string, codeHashes: string[]) {
    return this.db.recoveryCode.createMany({
      data: codeHashes.map((codeHash) => ({ userId, codeHash })),
    });
  }

  async findUnused(userId: string) {
    return this.db.recoveryCode.findMany({
      where: { userId, usedAt: null },
    });
  }

  async markUsed(id: string) {
    return this.db.recoveryCode.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async countUnused(userId: string) {
    return this.db.recoveryCode.count({
      where: { userId, usedAt: null },
    });
  }
}
