import { requestHandler } from "@/lib/request-handler";
import { requireApiUser } from "@/lib/auth-utils";
import { sessionService } from "@/modules/auth/services/session.service";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  return requestHandler(async () => {
    const user = await requireApiUser();
    const { id } = await params;
    return sessionService.revokeOne(user.id, id);
  });
}
