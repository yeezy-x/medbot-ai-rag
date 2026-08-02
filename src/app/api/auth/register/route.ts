import { requestHandler } from "@/lib/request-handler";
import { validate } from "@/lib/validate";
import { registerSchema } from "@/modules/auth/schemas/auth.schema";
import { AuthService } from "@/modules/auth/services/auth.service";
import { emailVerificationService } from "@/modules/auth/services/email-verification.service";
import { getClientIp } from "@/modules/auth/utils/device";

const authService = new AuthService();

export async function POST(request: Request) {
  return requestHandler(async () => {
    const body = await request.json();
    const data = validate(registerSchema, body);
    const user = await authService.register(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      },
      {
        ip: getClientIp(request.headers),
        userAgent: request.headers.get("user-agent"),
      }
    );

    const verification = await emailVerificationService.sendVerification(
      user.id
    );

    return {
      id: user.id,
      emailVerificationRequired: true,
      ...("devVerifyUrl" in verification
        ? { devVerifyUrl: verification.devVerifyUrl }
        : {}),
    };
  });
}
