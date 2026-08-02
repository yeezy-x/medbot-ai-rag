import { requestHandler } from "@/lib/request-handler";
import { requireApiUser } from "@/lib/auth-utils";
import { validate } from "@/lib/validate";
import {
  changePasswordSchema,
  updateProfileSchema,
} from "@/modules/auth/schemas/auth.schema";
import { accountService } from "@/modules/auth/services/account.service";

export async function PATCH(request: Request) {
  return requestHandler(async () => {
    const user = await requireApiUser();
    const body = await request.json();
    const data = validate(updateProfileSchema, body);
    return accountService.updateProfile(user.id, data);
  });
}

export async function PUT(request: Request) {
  return requestHandler(async () => {
    const user = await requireApiUser();
    const body = await request.json();
    const data = validate(changePasswordSchema, body);
    return accountService.changePassword(user.id, {
      currentPassword: data.currentPassword || "",
      password: data.password,
    });
  });
}
