import { requestHandler } from "@/lib/request-handler";
import { requireApiUser } from "@/lib/auth-utils";
import { sessionService } from "@/modules/auth/services/session.service";

export async function GET() {
  return requestHandler(async () => {
    const user = await requireApiUser();
    return sessionService.listForUser(user.id, user.jti);
  });
}

export async function DELETE() {
  return requestHandler(async () => {
    const user = await requireApiUser();
    return sessionService.revokeAll(user.id, user.jti);
  });
}
