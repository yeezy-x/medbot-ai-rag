import { BaseRepository } from "@/core/repositories/base.repository";
import type { AccountStatus, Role } from "@/generated/client";

export class UserRepository extends BaseRepository {
  async findByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.db.user.findUnique({
      where: { id },
    });
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash?: string | null;
    role?: Role;
    emailVerified?: Date | null;
    status?: AccountStatus;
  }) {
    return this.db.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash ?? null,
        role: data.role ?? "USER",
        emailVerified: data.emailVerified ?? null,
        status: data.status ?? "ACTIVE",
      },
    });
  }

  async exists(email: string) {
    const user = await this.findByEmail(email);
    return !!user;
  }

  async updateMfa(
    userId: string,
    data: {
      mfaEnabled?: boolean;
      mfaSecretEnc?: string | null;
    }
  ) {
    return this.db.user.update({
      where: { id: userId },
      data,
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return this.db.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });
  }

  async recordFailedLogin(userId: string, lockedUntil: Date | null) {
    return this.db.user.update({
      where: { id: userId },
      data: {
        failedLoginCount: { increment: 1 },
        lockedUntil,
      },
    });
  }

  async resetFailedLogin(userId: string) {
    return this.db.user.update({
      where: { id: userId },
      data: { failedLoginCount: 0, lockedUntil: null },
    });
  }

  async bumpTokenVersion(userId: string) {
    return this.db.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  async updateProfile(
    userId: string,
    data: { name?: string; image?: string | null }
  ) {
    return this.db.user.update({
      where: { id: userId },
      data,
    });
  }

  async updateEmail(userId: string, email: string) {
    return this.db.user.update({
      where: { id: userId },
      data: { email, emailVerified: new Date() },
    });
  }

  async setEmailVerified(userId: string) {
    return this.db.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });
  }

  async setStatus(userId: string, status: AccountStatus) {
    return this.db.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  async deleteUser(userId: string) {
    return this.db.user.delete({ where: { id: userId } });
  }
}
