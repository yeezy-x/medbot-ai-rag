import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    console.log(
      "No ADMIN_EMAIL set. Sign up with Clerk, then re-run seed with ADMIN_EMAIL=you@example.com to promote that user."
    );
    return;
  }

  const result = await prisma.user.updateMany({
    where: { email },
    data: { role: "ADMIN", status: "ACTIVE" },
  });

  if (result.count === 0) {
    console.log(
      `No local user found for ${email}. Sign in once so Clerk can sync the row, then seed again.`
    );
    return;
  }

  console.log(`Promoted ${email} to ADMIN.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
