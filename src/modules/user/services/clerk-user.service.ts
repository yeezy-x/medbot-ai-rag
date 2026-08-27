import { currentUser, type User } from "@clerk/nextjs/server";

import { AuthError } from "@/lib/errors/auth-error";
import { UserRepository } from "@/modules/user/repositories";

export type ClerkProfile = {
  clerkId: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: Date | null;
};

function displayName(first?: string | null, last?: string | null, email?: string) {
  const joined = [first, last].filter(Boolean).join(" ").trim();
  return joined || email || "MedBot user";
}

export function profileFromClerkUser(user: User): ClerkProfile {
  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new AuthError("Clerk account is missing an email address.");
  }
  const verified = user.primaryEmailAddress?.verification?.status === "verified";
  return {
    clerkId: user.id,
    name: displayName(user.firstName, user.lastName, email),
    email,
    image: user.imageUrl ?? null,
    emailVerified: verified ? new Date() : null,
  };
}

export function profileFromWebhookUser(data: {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  email_addresses?: Array<{
    id: string;
    email_address: string;
    verification?: { status?: string } | null;
  }>;
  primary_email_address_id?: string | null;
}): ClerkProfile {
  const emails = data.email_addresses ?? [];
  const primary =
    emails.find((e) => e.id === data.primary_email_address_id) ?? emails[0];
  if (!primary?.email_address) {
    throw new Error("Clerk webhook user is missing an email address.");
  }
  const verified = primary.verification?.status === "verified";
  return {
    clerkId: data.id,
    name: displayName(data.first_name, data.last_name, primary.email_address),
    email: primary.email_address,
    image: data.image_url ?? null,
    emailVerified: verified ? new Date() : null,
  };
}

export class ClerkUserService {
  private users = new UserRepository();

  async syncProfile(profile: ClerkProfile) {
    const byClerk = await this.users.findByClerkId(profile.clerkId);
    if (byClerk) {
      return this.users.upsertByClerkId(profile);
    }

    const byEmail = await this.users.findByEmail(profile.email);
    if (byEmail && byEmail.clerkId.startsWith("legacy_")) {
      return this.users.linkClerkId(byEmail.id, profile);
    }
    if (byEmail && byEmail.clerkId !== profile.clerkId) {
      throw new AuthError("That email is already linked to another account.");
    }

    return this.users.upsertByClerkId(profile);
  }

  async getOrCreateForClerkId(clerkUserId: string) {
    const existing = await this.users.findByClerkId(clerkUserId);
    if (existing) {
      if (existing.status !== "ACTIVE") {
        throw new AuthError("Account is not active.");
      }
      return existing;
    }

    const clerkUser = await currentUser();
    if (!clerkUser || clerkUser.id !== clerkUserId) {
      throw new AuthError("Sign in required.");
    }

    const user = await this.syncProfile(profileFromClerkUser(clerkUser));
    if (user.status !== "ACTIVE") {
      throw new AuthError("Account is not active.");
    }
    return user;
  }

  async deleteByClerkId(clerkUserId: string) {
    const existing = await this.users.findByClerkId(clerkUserId);
    if (!existing) return;
    await this.users.deleteUser(existing.id);
  }
}

export const clerkUserService = new ClerkUserService();
