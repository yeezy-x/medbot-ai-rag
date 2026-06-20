import { BaseRepository }
from "./base.repository";

export class CitationRepository
extends BaseRepository {

  async createMany(
    citations: {
      pageNumber: number;
      chunkId: string;
      sourceTitle: string;
      messageId: string;
    }[]
  ) {
    return this.db.citation.createMany({
      data: citations,
    });
  }

  async findByMessageId(
    messageId: string
  ) {
    return this.db.citation.findMany({
      where: {
        messageId,
      },
    });
  }
}