import { BaseRepository } from "@/core/repositories/base.repository";
import type { AccountStatus, Role } from "@/generated/client";

export type CreateLocalUserInput = {
  clerkId: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  role?: Role;
  status?: AccountStatus;
};

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

  async findByClerkId(clerkId: string) {
    return this.db.user.findUnique({
      where: { clerkId },
    });
  }

  async create(data: CreateLocalUserInput) {
    return this.db.user.create({
      data: {
        clerkId: data.clerkId,
        name: data.name,
        email: data.email,
        image: data.image ?? null,
        role: data.role ?? "USER",
        emailVerified: data.emailVerified ?? null,
        status: data.status ?? "ACTIVE",
      },
    });
  }

  async upsertByClerkId(data: CreateLocalUserInput) {
    return this.db.user.upsert({
      where: { clerkId: data.clerkId },
      create: {
        clerkId: data.clerkId,
        name: data.name,
        email: data.email,
        image: data.image ?? null,
        role: data.role ?? "USER",
        emailVerified: data.emailVerified ?? null,
        status: data.status ?? "ACTIVE",
      },
      update: {
        name: data.name,
        email: data.email,
        image: data.image ?? null,
        emailVerified: data.emailVerified ?? undefined,
      },
    });
  }

  async linkClerkId(userId: string, data: CreateLocalUserInput) {
    return this.db.user.update({
      where: { id: userId },
      data: {
        clerkId: data.clerkId,
        name: data.name,
        email: data.email,
        image: data.image ?? null,
        emailVerified: data.emailVerified ?? undefined,
        status: "ACTIVE",
      },
    });
  }

  async exists(email: string) {
    const user = await this.findByEmail(email);
    return !!user;
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
