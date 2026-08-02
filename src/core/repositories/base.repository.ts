import { prisma } from "@/db";

export abstract class BaseRepository {
  protected db = prisma;
}