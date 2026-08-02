import { z } from "zod";

import { requestHandler } from "@/lib/request-handler";
import { validate } from "@/lib/validate";
import { emailVerificationService } from "@/modules/auth/services/email-verification.service";

const verifySchema = z.object({
  email: z.email().toLowerCase(),
  token: z.string().min(1),
});

const resendSchema = z.object({
  email: z.email().toLowerCase(),
});

export async function POST(request: Request) {
  return requestHandler(async () => {
    const body = await request.json();
    const data = validate(verifySchema, body);
    return emailVerificationService.verify(data.email, data.token);
  });
}

export async function PUT(request: Request) {
  return requestHandler(async () => {
    const body = await request.json();
    const data = validate(resendSchema, body);
    return emailVerificationService.sendVerificationByEmail(data.email);
  });
}
