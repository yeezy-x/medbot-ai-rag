import { DefaultJWT } from "@auth/core/jwt";
import type { UserRole } from "@/types/auth.types";

export type { UserRole };

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      mfaVerified: boolean;
      jti?: string;
      tokenVersion?: number;
      authTime?: number;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role?: UserRole;
    mfaVerified?: boolean;
    /** AuthSession registry id (avoid `jti` — reserved by Auth.js JWT). */
    sessionId?: string;
    jti?: string;
    tokenVersion?: number;
    authTime?: number;
  }
}

declare module "@auth/core/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    mfaVerified: boolean;
    /** AuthSession registry id — must NOT use claim name `jti` (reserved by Auth.js encode). */
    sid?: string;
    tokenVersion?: number;
    authTime?: number;
  }
}
