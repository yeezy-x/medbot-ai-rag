import { BaseRepository } from "@/core/repositories/base.repository";
import type { AuthTokenType, Prisma } from "@/generated/client";

export class AuthTokenRepository extends BaseRepository {
  async create(data: {
    userId?: string | null;
    type: AuthTokenType;
    identifier: string;
    tokenHash: string;
    expiresAt: Date;
    meta?: Prisma.InputJsonValue;
  }) {
    return this.db.authToken.create({
      data: {
        userId: data.userId ?? null,
        type: data.type,
        identifier: data.identifier,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        meta: data.meta ?? undefined,
      },
    });
  }

  async deleteUnconsumed(type: AuthTokenType, identifier: string) {
    return this.db.authToken.deleteMany({
      where: { type, identifier, consumedAt: null },
    });
  }

  async findValid(type: AuthTokenType, identifier: string, tokenHash: string) {
    return this.db.authToken.findFirst({
      where: {
        type,
        identifier,
        tokenHash,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async consume(id: string) {
    return this.db.authToken.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }
}
