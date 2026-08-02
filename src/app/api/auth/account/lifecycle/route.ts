import { z } from "zod";

import { requestHandler } from "@/lib/request-handler";
import { requireApiUser } from "@/lib/auth-utils";
import { validate } from "@/lib/validate";
import { accountService } from "@/modules/auth/services/account.service";
import { signOut } from "@/lib/auth";

const passwordSchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  return requestHandler(async () => {
    const user = await requireApiUser();
    const body = await request.json();
    const data = validate(passwordSchema, body);
    const result = await accountService.deactivate(user.id, data.password);
    await signOut({ redirect: false });
    return result;
  });
}

export async function DELETE(request: Request) {
  return requestHandler(async () => {
    const user = await requireApiUser();
    const body = await request.json();
    const data = validate(passwordSchema, body);
    const result = await accountService.deleteAccount(user.id, data.password);
    await signOut({ redirect: false });
    return result;
  });
}
