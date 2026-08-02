import { requestHandler } from "@/lib/request-handler";
import { requireApiUser } from "@/lib/auth-utils";
import { accountLinkService } from "@/modules/auth/services/account-link.service";
import { validate } from "@/lib/validate";
import { z } from "zod";

export async function GET() {
  return requestHandler(async () => {
    const user = await requireApiUser();
    return accountLinkService.listLinkedProviders(user.id);
  });
}

const unlinkSchema = z.object({
  provider: z.string().min(1),
});

export async function DELETE(request: Request) {
  return requestHandler(async () => {
    const user = await requireApiUser();
    const body = await request.json();
    const data = validate(unlinkSchema, body);
    return accountLinkService.unlinkProvider(user.id, data.provider);
  });
}
