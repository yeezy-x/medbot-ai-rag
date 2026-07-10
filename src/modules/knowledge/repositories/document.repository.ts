import { Prisma } from "@/generated/client";
import { BaseRepository } from "@/repositories/base.repository";

export class DocumentRepository extends BaseRepository {

  async create(
    data: Prisma.DocumentCreateInput
  ) {
    return this.db.document.create({
      data,
    });
  }

  async findById(
    id: string
  ) {
    return this.db.document.findUnique({
      where: {
        id,
      },
    });
  }

  async findByTitle(
    title: string
  ) {
    return this.db.document.findFirst({
      where: {
        title,
      },
    });
  }

  async findAll() {
    return this.db.document.findMany({
      orderBy: {
        uploadedAt: "desc",
      },
    });
  }

  async delete(
    id: string
  ) {
    return this.db.document.delete({
      where: {
        id,
      },
    });
  }
}