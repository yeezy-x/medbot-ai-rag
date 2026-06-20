import { prisma } from "./prisma";

export async function executeTransaction<T>(
  callback: Parameters<typeof prisma.$transaction>[0]
) {
  return prisma.$transaction(
    callback
  );
}