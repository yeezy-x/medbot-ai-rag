import { cookies } from "next/headers";

import { requestHandler } from "@/lib/request-handler";
import { requireApiUser } from "@/lib/auth-utils";
import { mfaService } from "@/modules/auth/services/mfa.service";
import { TRUSTED_DEVICE_TTL_MS } from "@/modules/auth/constants/auth.constants";

const COOKIE = "medbot.trusted_device";

export async function POST(request: Request) {
  return requestHandler(async () => {
    const user = await requireApiUser();
    const ua = request.headers.get("user-agent");
    const { token, expiresAt } = await mfaService.trustDevice(user.id, ua);

    const jar = await cookies();
    jar.set(COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
      maxAge: Math.floor(TRUSTED_DEVICE_TTL_MS / 1000),
    });

    return { trusted: true };
  });
}
