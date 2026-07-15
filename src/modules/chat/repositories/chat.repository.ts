// src/repositories/chat.repository.ts

import { prisma } from "@/lib/prisma";

import {
  Prisma,
} from "@/generated/client";

import {
  CitationReference,
} from "@/modules/knowledge/types/retrieval.types";
import { CreateMessageDto } from "../types/chat-repository.types";

export class ChatRepository {

  // ---------------------------------------------------------------------------
  // Chat Session
  // ---------------------------------------------------------------------------

  async create(
    data: Prisma.ChatSessionCreateInput
  ) {
    return prisma.chatSession.create({
      data,
    });
  }

  async findById(
    chatId: string
  ) {
    return prisma.chatSession.findUnique({
      where: {
        id: chatId,
      },
    });
  }

  async findByIdAndUserId(
    chatId: string,
    userId: string
  ) {
    return prisma.chatSession.findFirst({
      where: {
        id: chatId,
        userId,
      },
    });
  }

  async findByUserId(
    userId: string
  ) {
    return prisma.chatSession.findMany({
      where: {
        userId,
      },

      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async delete(
    chatId: string
  ) {
    return prisma.chatSession.delete({
      where: {
        id: chatId,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Messages
  // ---------------------------------------------------------------------------

  async createMessage(
    data: CreateMessageDto
  ) {
    return prisma.message.create({
      data: {
        sessionId: data.sessionId,
        role: data.role,
        content: data.content,
      },
    });
  }

  async getConversation(
    sessionId: string
  ) {
    return prisma.message.findMany({
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

    await prisma.citation.createMany({
      data: citations.map(
        citation => ({
          messageId,

          chunkId:
            citation.chunkId,

          pageNumber:
            citation.pageNumber ?? 0,

          sourceTitle:
            citation.sourceTitle,
        })
      ),
    });
  }
}