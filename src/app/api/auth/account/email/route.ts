import { requestHandler } from "@/lib/request-handler";
import { requireApiUser } from "@/lib/auth-utils";
import { validate } from "@/lib/validate";
import { changeEmailSchema } from "@/modules/auth/schemas/auth.schema";
import { accountService } from "@/modules/auth/services/account.service";
import { z } from "zod";

const confirmSchema = z.object({
  email: z.email().toLowerCase(),
  token: z.string().min(1),
});

export async function POST(request: Request) {
  return requestHandler(async () => {
    const user = await requireApiUser();
    const body = await request.json();
    const data = validate(changeEmailSchema, body);
    return accountService.requestEmailChange(
      user.id,
      data.email,
      data.password
    );
  });
}

export async function PUT(request: Request) {
  return requestHandler(async () => {
    await requireApiUser();
    const body = await request.json();
    const data = validate(confirmSchema, body);
    return accountService.confirmEmailChange(data.email, data.token);
  });
}
