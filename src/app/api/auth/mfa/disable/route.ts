import { requestHandler } from "@/lib/request-handler";
import { requireApiUser, requireStepUp } from "@/lib/auth-utils";
import { validate } from "@/lib/validate";
import { mfaCodeSchema } from "@/modules/auth/schemas/auth.schema";
import { MfaService } from "@/modules/auth/services/mfa.service";

const mfaService = new MfaService();

export async function POST(request: Request) {
  return requestHandler(async () => {
    await requireStepUp();
    const user = await requireApiUser();
    const body = await request.json();
    const data = validate(mfaCodeSchema, body);
    return mfaService.disable(user.id, data.code);
  });
}
