import { BaseRepository }
from "./base.repository";

export class DocumentRepository
extends BaseRepository {

  async create(data: {
    title: string;
    version: string;
    source: string;
  }) {
    return this.db.document.create({
      data,
    });
  }

  async findAll() {
    return this.db.document.findMany({
      orderBy: {
        uploadedAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return this.db.document.findUnique({
      where: { id },
    });
  }
}