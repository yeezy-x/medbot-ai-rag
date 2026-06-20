import { prisma }
from "./prisma";

export async function transaction<T>(
  fn: Parameters<typeof prisma.$transaction>[0]
) {
  return prisma.$transaction(fn);
}