import {
  ChatRepository,
} from "@/repositories";

import {
  NotFoundError,
} from "@/lib/errors/not-found-error";

import {
  ForbiddenError,
} from "@/lib/errors/forbidden-error";

import {
  BaseService,
} from "@/services/base.service";

import {
  RAGService,
} from "@/modules/knowledge/services/rag.service";

import type {
  RAGConversationMessage,
} from "@/modules/knowledge/types/rag.types";

import type {
  SendMessageRequest,
  SendMessageResponse,
} from "../types/chat.types";

export class ChatService extends BaseService {
  private readonly chatRepository =
    new ChatRepository();

  private readonly ragService =
    new RAGService();

  async createChat(
    title: string,
    userId: string
  ) {
    const chat =
      await this.chatRepository.create({
        title,
        userId,
      });

    this.logger.info({
      event: "CHAT_CREATED",
      chatId: chat.id,
      userId: chat.userId,
    });

    return chat;
  }

  async getChat(
    chatId: string
  ) {
    const chat =
      await this.chatRepository.findById(
        chatId
      );

    if (!chat) {
      throw new NotFoundError(
        "Chat not found"
      );
    }

    return chat;
  }

  async getChatById(
    chatId: string,
    userId: string
  ) {
    const chat =
      await this.chatRepository.findByIdAndUserId(
        chatId,
        userId
      );

    if (!chat) {
      throw new NotFoundError(
        "Chat not found."
      );
    }

    if (chat.userId !== userId) {
      throw new ForbiddenError();
    }

    return chat;
  }

  async getUserChats(
    userId: string
  ) {
    return this.chatRepository.findByUserId(
      userId
    );
  }

  async deleteChat(
    chatId: string,
    userId: string
  ) {
    const chat =
      await this.getChatById(
        chatId,
        userId
      );

    await this.chatRepository.delete(
      chat.id
    );

    return {
      deleted: true,
    };
  }

  async sendMessage(
    request: SendMessageRequest
  ): Promise<SendMessageResponse> {
    // 1. Validate ownership
    await this.getChatById(
      request.chatId,
      request.userId
    );

    // 2. Load previous conversation history
    const conversation =
      await this.chatRepository.getConversation(
        request.chatId
      );

    const history: RAGConversationMessage[] =
      conversation.map((message) => ({
        role: message.role,
        content: message.content,
      }));

    // 3. Persist current user message
    await this.chatRepository.createMessage({
      sessionId: request.chatId,
      role: "USER",
      content: request.message,
    });

    // 4. Run RAG pipeline
    const ragResponse =
      await this.ragService.generate({
        question: request.message,
        history,
      });

    // 5. Persist assistant message
    const assistantMessage =
      await this.chatRepository.createMessage({
        sessionId: request.chatId,
        role: "ASSISTANT",
        content: ragResponse.answer,
      });

    // 6. Persist citations
    await this.chatRepository.createCitations(
      assistantMessage.id,
      ragResponse.citations
    );

    // 7. Return response
    return {
      answer: ragResponse.answer,
      citations: ragResponse.citations,
    };
  }

  async getConversation(
    chatId: string,
    userId: string
  ) {
    await this.getChatById(
      chatId,
      userId
    );

    return this.chatRepository.getConversation(
      chatId
    );
  }
}