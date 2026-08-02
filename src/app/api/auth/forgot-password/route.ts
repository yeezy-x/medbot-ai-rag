import { requestHandler } from "@/lib/request-handler";
import { validate } from "@/lib/validate";
import { forgotPasswordSchema } from "@/modules/auth/schemas/auth.schema";
import { passwordResetService } from "@/modules/auth/services/password-reset.service";

export async function POST(request: Request) {
  return requestHandler(async () => {
    const body = await request.json();
    const data = validate(forgotPasswordSchema, body);
    return passwordResetService.requestReset(data.email);
  });
}
