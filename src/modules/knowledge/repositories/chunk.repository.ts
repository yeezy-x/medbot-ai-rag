// src/modules/knowledge/repositories/chunk.repository.ts

import { Prisma } from "@/generated/client";
import { BaseRepository } from "@/repositories/base.repository";

export class ChunkRepository extends BaseRepository {

  async create(
    data: Prisma.ChunkCreateInput
  ) {
    return this.db.chunk.create({
      data,
    });
  }

  async createMany(
    data: Prisma.ChunkCreateManyInput[]
  ) {
    return this.db.chunk.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findById(
    id: string
  ) {
    return this.db.chunk.findUnique({
      where: {
        id,
      },
    });
  }

  async findByDocument(
    documentId: string
  ) {
    return this.db.chunk.findMany({
      where: {
        documentId,
      },

      orderBy: {
        chunkIndex: "asc",
      },
    });
  }

  async count() {
    return this.db.chunk.count();
  }

  async deleteByDocument(
    documentId: string
  ) {
    return this.db.chunk.deleteMany({
      where: {
        documentId,
      },
    });
  }
}