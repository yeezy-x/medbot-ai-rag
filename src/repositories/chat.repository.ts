// src/repositories/chat.repository.ts


import { BaseRepository } from "./base.repository";

import { CitationReference } from "@/modules/knowledge/types/retrieval.types";
import { CreateMessageDto } from "@/modules/chat/types/chat-repository.types";


export class ChatRepository extends BaseRepository {

  // ---------------------------------------------------------------------------
  // Chat Sessions
  // ---------------------------------------------------------------------------

  async create(
    data: {
      title: string;
      userId: string;
    }
  ) {
    return this.db.chatSession.create({
      data:{
        title: data.title,
        user:{
          connect:{
            id: data.userId
          }
        }
      }
    });
  }

  async findById(
    id: string
  ) {
    return this.db.chatSession.findUnique({
      where: {
        id,
      },
    });
  }

  async findByIdAndUserId(
    id: string,
    userId: string
  ) {
    return this.db.chatSession.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async findByUserId(
    userId: string
  ) {
    return this.db.chatSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async updateTitle(
    id: string,
    title: string
  ) {
    return this.db.chatSession.update({
      where: {
        id,
      },
      data: {
        title,
      },
    });
  }

  async delete(
    id: string
  ) {
    return this.db.chatSession.delete({
      where: {
        id,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Messages
  // ---------------------------------------------------------------------------

  async createMessage(
    data: CreateMessageDto
  ) {
    return this.db.message.create({
      data: {
        sessionId: data.sessionId,
        role: data.role, // Type assertion to bypass type mismatch
        content: data.content,
      },
    });
  }

  async getConversation(
    sessionId: string
  ) {
    return this.db.message.findMany({
      where: {
        sessionId,
      },
      include: {
        citations: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Citations
  // ---------------------------------------------------------------------------

  async createCitations(
    messageId: string,
    citations: CitationReference[]
  ) {
    if (citations.length === 0) {
      return;
    }

    return this.db.citation.createMany({
      data: citations.map(
        citation => ({
          messageId,
          chunkId: citation.chunkId,
          pageNumber: citation.pageNumber ?? 0,
          sourceTitle: citation.sourceTitle,
        })
      ),
    });
  }
}