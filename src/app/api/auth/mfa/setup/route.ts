import { requestHandler } from "@/lib/request-handler";
import { requireApiUser } from "@/lib/auth-utils";
import { MfaService } from "@/modules/auth/services/mfa.service";

const mfaService = new MfaService();

export async function GET() {
  return requestHandler(async () => {
    const user = await requireApiUser();
    return mfaService.getStatus(user.id);
  });
}

export async function POST() {
  return requestHandler(async () => {
    const user = await requireApiUser();
    return mfaService.beginSetup(user.id);
  });
}
