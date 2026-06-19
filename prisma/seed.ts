import bcrypt from "bcrypt";
import "dotenv/config"
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool=new Pool({connectionString:process.env.DATABASE_URL})
const adapter=new PrismaPg(pool)
const prisma = new PrismaClient({adapter});

async function main() {
  const passwordHash =
    await bcrypt.hash(
      "password123",
      12
    );

  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@medbot.com",
      passwordHash,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());