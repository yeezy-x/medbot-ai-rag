import { NextResponse }
from "next/server";

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
  const body =
    await request.json();

  const validated =
    registerSchema.parse(body);

  const user =
    await authService.register(
      validated
    );

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
    },
  });
}