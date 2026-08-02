import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { mfaService } from "@/modules/auth/services/mfa.service";

/**
 * Next.js 16 proxy (formerly middleware). Optimistic auth gate.
 * Page/API helpers remain the authoritative second layer.
 */
export const proxy = auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth?.user?.id);
  let mfaOk = req.auth?.user?.mfaVerified !== false;
  const isApi =
    pathname.startsWith("/api/chats") ||
    pathname.startsWith("/api/chunks") ||
    pathname.startsWith("/api/documents") ||
    pathname.startsWith("/api/admin");

  if (isLoggedIn && !mfaOk && req.auth?.user?.id) {
    const trusted = req.cookies.get("medbot.trusted_device")?.value;
    if (trusted) {
      const ok = await mfaService.isTrustedDevice(req.auth.user.id, trusted);
      if (ok) {
        mfaOk = true;
      }
    }
  }

  if (isApi && (!isLoggedIn || !mfaOk)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: mfaOk ? "Sign in required." : "MFA verification required",
        },
      },
      { status: 401 }
    );
  }

  if (!isLoggedIn && !isApi) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (isLoggedIn && !mfaOk && !pathname.startsWith("/login/mfa")) {
    return NextResponse.redirect(new URL("/login/mfa", req.nextUrl.origin));
  }
});

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/chat",
    "/chat/:path*",
    "/settings",
    "/settings/:path*",
    "/login/mfa",
    "/api/chats/:path*",
    "/api/chunks/:path*",
    "/api/documents/:path*",
    "/api/admin/:path*",
  ],
};
