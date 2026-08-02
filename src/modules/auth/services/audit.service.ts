import { BaseService } from "@/core/services/base.service";
import type { AuditAction, Prisma } from "@/generated/client";
import { AuditLogRepository } from "../repositories/audit-log.repository";

export type AuditContext = {
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  meta?: Prisma.InputJsonValue;
};

export class AuditService extends BaseService {
  private repo = new AuditLogRepository();

  async log(action: AuditAction, ctx: AuditContext = {}) {
    try {
      await this.repo.create({
        action,
        userId: ctx.userId,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        meta: ctx.meta,
      });
    } catch (error) {
      this.logger.error({ event: "AUDIT_LOG_FAILED", action, error });
    }
  }
}

export const auditService = new AuditService();
