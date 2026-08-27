import { requestHandler } from "@/lib/request-handler";
import { requireApiUser } from "@/lib/auth-utils";
import { prisma } from "@/db";

export async function GET() {
  return requestHandler(async () => {
    const sessionUser = await requireApiUser();
    return prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        image: true,
        emailVerified: true,
        status: true,
        createdAt: true,
      },
    });
  });
}
