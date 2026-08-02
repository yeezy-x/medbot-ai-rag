import { requestHandler } from "@/lib/request-handler";
import { requireApiUser } from "@/lib/auth-utils";
import { prisma } from "@/db";

export async function GET() {
  return requestHandler(async () => {
    const sessionUser = await requireApiUser();
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        emailVerified: true,
        mfaEnabled: true,
        status: true,
        createdAt: true,
      },
    });
    return user;
  });
}
