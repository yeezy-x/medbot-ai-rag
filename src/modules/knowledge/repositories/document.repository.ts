import { BaseRepository } from "@/core/repositories/base.repository";

export interface CreateDocumentData {
  title: string;
  version: string;
  fileName: string;
  language: string;
  sourceType: string;
  checksum?: string;
}

export class DocumentRepository extends BaseRepository {
  async create(data: CreateDocumentData) {
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
      where: {
        id,
      },
    });
  }

  async findByChecksum(checksum: string) {
    return this.db.document.findUnique({
      where: {
        checksum,
      },
    });
  }

  async countChunks(documentId: string): Promise<number> {
    return this.db.chunk.count({
      where: {
        documentId,
      },
    });
  }

  async delete(id: string) {
    return this.db.document.delete({
      where: {
        id,
      },
    });
  }
}