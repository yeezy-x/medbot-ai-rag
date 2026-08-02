import { requestHandler } from "@/lib/request-handler";
import { requireApiUser } from "@/lib/auth-utils";
import { accountService } from "@/modules/auth/services/account.service";

export async function GET() {
  return requestHandler(async () => {
    const user = await requireApiUser();
    return accountService.exportAccount(user.id);
  });
}
