import Credentials from "next-auth/providers/credentials";
import { getToken } from "next-auth/jwt";

import { env } from "@/config/env";
import { AuthService } from "../services/auth.service";
import { MfaService } from "../services/mfa.service";
import { sessionService } from "../services/session.service";
import type { UserRole } from "@/types/auth.types";
import { prisma } from "@/db";
import { getClientIp } from "../utils/device";

const authService = new AuthService();
const mfaService = new MfaService();

function metaFromRequest(request: Request) {
  return {
    ip: getClientIp(request.headers),
    userAgent: request.headers.get("user-agent"),
  };
}

export function createCredentialsProvider() {
  return Credentials({
    id: "credentials",
    name: "Email and Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, request) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      try {
        const user = await authService.login(
          {
            email: String(credentials.email),
            password: String(credentials.password),
          },
          metaFromRequest(request as Request)
        );
        return user;
      } catch {
        return null;
      }
    },
  });
}

export function createMfaProvider() {
  return Credentials({
    id: "mfa-verify",
    name: "MFA",
    credentials: {
      code: { label: "Code", type: "text" },
      rememberDevice: { label: "Remember", type: "text" },
    },
    async authorize(credentials, request) {
      const code = credentials?.code as string | undefined;
      if (!code) return null;

      const token = await getToken({
        req: request as never,
        secret: env.AUTH_SECRET,
      });

      if (!token?.id || token.mfaVerified) {
        return null;
      }

      const userId = token.id as string;
      const ok = await mfaService.verifyCode(userId, code);
      if (!ok) return null;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.status !== "ACTIVE") return null;

      const meta = metaFromRequest(request as Request);
      const jti = await sessionService.rotate(
        userId,
        (token.sid as string | undefined) ??
          (token.jti as string | undefined),
        meta
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        mfaVerified: true,
        sessionId: jti,
        tokenVersion: user.tokenVersion,
        authTime: Math.floor(Date.now() / 1000),
        rememberDevice: credentials?.rememberDevice === "true",
      };
    },
  });
}
