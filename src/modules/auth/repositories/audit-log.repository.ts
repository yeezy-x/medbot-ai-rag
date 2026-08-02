import { BaseRepository } from "@/core/repositories/base.repository";
import type { AuditAction, Prisma } from "@/generated/client";

export class AuditLogRepository extends BaseRepository {
  async create(data: {
    userId?: string | null;
    action: AuditAction;
    ip?: string | null;
    userAgent?: string | null;
    meta?: Prisma.InputJsonValue;
  }) {
    return this.db.auditLog.create({
      data: {
        userId: data.userId ?? null,
        action: data.action,
        ip: data.ip ?? null,
        userAgent: data.userAgent ?? null,
        meta: data.meta ?? undefined,
      },
    });
  }

  async listForUser(userId: string, take = 50) {
    return this.db.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    });
  }
}
