import {
  requestHandler,
} from "@/lib/request-handler";

import {
  validate,
} from "@/lib/validate";

import {
  registerSchema,
} from "@/modules/auth/schemas/auth.schema";

import {
  AuthService,
} from "@/modules/auth/services/auth.service";

const authService =
  new AuthService();

export async function POST(
  request: Request
) {
  return requestHandler(
    async () => {
      const body = await request.json();

      const data =
        validate(
          registerSchema,
          body
        );

      const user =
        await authService.register(
          data
        );

      return {
        id: user.id,
      };
    }
  );
}