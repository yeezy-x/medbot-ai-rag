import { requestHandler } from "@/lib/request-handler";
import { requireApiAdmin } from "@/lib/auth-utils";

/** Minimal admin-only surface — proves role gating works. */
export async function GET() {
  return requestHandler(async () => {
    const admin = await requireApiAdmin();
    return {
      ok: true,
      adminId: admin.id,
      message: "Admin access granted",
    };
  });
}
