import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/db";
import { env, hasResendAuth } from "@/config/env";
import type { UserRole } from "@/types/auth.types";
import {
  createCredentialsProvider,
  createMfaProvider,
} from "@/modules/auth/providers/credentials.provider";
import { createGoogleProvider } from "@/modules/auth/providers/google.provider";
import { accountLinkService } from "@/modules/auth/services/account-link.service";
import { AuthService } from "@/modules/auth/services/auth.service";
import { sessionService } from "@/modules/auth/services/session.service";
import { mfaService } from "@/modules/auth/services/mfa.service";

const authService = new AuthService();
const google = createGoogleProvider();

const providers = [
  createCredentialsProvider(),
  createMfaProvider(),
  ...(google ? [google] : []),
  ...(hasResendAuth
    ? [
        Resend({
          apiKey: env.AUTH_RESEND_KEY!,
          from: env.EMAIL_FROM!,
        }),
      ]
    : []),
];

/**
 * IMPORTANT: Do not store our session registry id in `token.jti`.
 * Auth.js encode() calls EncryptJWT.setJti(randomUUID()) which overwrites
 * the standard JWT `jti` claim and was corrupting the session payload.
 * Use `sid` instead.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma as never),
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        const emailVerified =
          (profile as { email_verified?: boolean } | undefined)
            ?.email_verified !== false;
        if (!emailVerified) return false;
        try {
          const linked = await accountLinkService.ensureGoogleLink({
            email: user.email,
            name: user.name,
            image: user.image,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            id_token: account.id_token,
            scope: account.scope,
            token_type: account.token_type,
          });
          user.id = linked.id;
          return true;
        } catch {
          return false;
        }
      }
      if (account?.provider === "resend" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (existing && !existing.emailVerified) {
          await prisma.user.update({
            where: { id: existing.id },
            data: { emailVerified: new Date() },
          });
        }
        if (existing && existing.status !== "ACTIVE") return false;
      }
      return true;
    },
    async jwt({ token, user, account }): Promise<JWT> {
      // Plain JSON clone — jose payloads + object spread have wiped claims
      // on /api/auth/session re-encode in this app.
      const next = JSON.parse(JSON.stringify(token ?? {})) as JWT;

      if (user) {
        const userId = String(user.id);
        const u = user as {
          role?: UserRole;
          mfaVerified?: boolean;
          sessionId?: string;
          jti?: string;
          tokenVersion?: number;
          authTime?: number;
        };
        next.sub = userId;
        next.id = userId;
        next.email = user.email ?? "";
        next.name = user.name ?? "";
        next.role = u.role ?? "USER";
        next.mfaVerified =
          typeof u.mfaVerified === "boolean" ? u.mfaVerified : true;
        // Prefer sessionId — Auth.js may strip reserved `jti` off User.
        const sessionId =
          typeof u.sessionId === "string"
            ? u.sessionId
            : typeof u.jti === "string"
              ? u.jti
              : undefined;
        if (sessionId) next.sid = sessionId;
        next.tokenVersion =
          typeof u.tokenVersion === "number" ? u.tokenVersion : 0;
        next.authTime =
          typeof u.authTime === "number"
            ? u.authTime
            : Math.floor(Date.now() / 1000);

        if (
          (account?.provider === "google" || account?.provider === "resend") &&
          !next.sid
        ) {
          const created = await authService.createOAuthSession(userId);
          next.sid = created.jti;
          next.tokenVersion = created.tokenVersion;
          next.authTime = created.authTime;
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, mfaEnabled: true, email: true, name: true },
          });
          if (dbUser) {
            next.role = dbUser.role as UserRole;
            next.email = dbUser.email;
            next.name = dbUser.name;
            next.mfaVerified = !dbUser.mfaEnabled;
          }
        }
      }

      // Never persist Auth.js's rotating JWT `jti` as our session id claim.
      delete next.jti;

      return next;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? token.sub ?? "");
        session.user.email = String(token.email ?? "");
        session.user.name = String(token.name ?? "");
        session.user.role = (token.role as UserRole) ?? "USER";
        session.user.mfaVerified =
          typeof token.mfaVerified === "boolean" ? token.mfaVerified : true;
        session.user.jti = (token.sid as string | undefined) ?? undefined;
        session.user.tokenVersion = token.tokenVersion as number | undefined;
        session.user.authTime = token.authTime as number | undefined;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      const token = "token" in message ? message.token : null;
      const sid = token?.sid ?? token?.jti;
      if (sid && (token?.id || token?.sub)) {
        await sessionService.revokeCurrent(
          String(sid),
          String(token.id ?? token.sub)
        );
      }
    },
  },
  trustHost: true,
  secret: env.AUTH_SECRET,
});

export { mfaService };
