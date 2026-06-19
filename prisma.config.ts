import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "npx tsx prisma/seed.ts", // 👈 Add this line to specify your seed file location
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
