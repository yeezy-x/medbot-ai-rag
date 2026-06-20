import { MessageRole }
from "@prisma/client";

import { BaseRepository }
from "./base.repository";

export class MessageRepository
extends BaseRepository {

  async create(data: {
    role: MessageRole;
    content: string;
    sessionId: string;
  }) {
    return this.db.message.create({
      data,
    });
  }

  async findBySessionId(
    sessionId: string
  ) {
    return this.db.message.findMany({
      where: {
        sessionId,
      },

      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findById(id: string) {
    return this.db.message.findUnique({
      where: { id },
    });
  }
}