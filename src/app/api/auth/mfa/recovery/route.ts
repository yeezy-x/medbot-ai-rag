import { requestHandler } from "@/lib/request-handler";
import { requireApiUser, requireStepUp } from "@/lib/auth-utils";
import { MfaService } from "@/modules/auth/services/mfa.service";

const mfaService = new MfaService();

export async function POST() {
  return requestHandler(async () => {
    await requireStepUp();
    const user = await requireApiUser();
    const codes = await mfaService.generateRecoveryCodes(user.id);
    return { recoveryCodes: codes };
  });
}
