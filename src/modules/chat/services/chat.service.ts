import {
  ChatRepository,
} from "@/repositories";

import {
  NotFoundError,
} from "@/lib/errors/not-found-error";

import {
  BaseService,
} from "@/services/base.service";

import {
  RAGService,
  type RAGStreamEvent,
} from "@/modules/knowledge/services/rag.service";

import type {
  SendMessageRequest,
  SendMessageResponse,
} from "../types/chat.types";
import type { CitationReference } from "@/modules/knowledge/types/retrieval.types";
import { DEFAULT_TOP_K } from "@/modules/knowledge/constants/retrieval.constants";

export class ChatService extends BaseService {
  private readonly chatRepository = new ChatRepository();
  private readonly ragService = new RAGService();

  async createChat(title: string, userId: string) {
    const chat = await this.chatRepository.create({ title, userId });
    this.logger.info({
      event: "CHAT_CREATED",
      chatId: chat.id,
      userId: chat.userId,
    });
    return chat;
  }

  async getChat(chatId: string) {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) throw new NotFoundError("Chat not found");
    return chat;
  }

  async getChatById(chatId: string, userId: string) {
    const chat = await this.chatRepository.findByIdAndUserId(chatId, userId);
    if (!chat) throw new NotFoundError("Chat not found.");
    return chat;
  }

  async getUserChats(userId: string) {
    return this.chatRepository.findByUserId(userId);
  }

  async deleteChat(chatId: string, userId: string) {
    const chat = await this.getChatById(chatId, userId);
    await this.chatRepository.delete(chat.id);
    return { deleted: true };
  }

  async renameChat(chatId: string, userId: string, title: string) {
    await this.getChatById(chatId, userId);
    const trimmed = title.trim().slice(0, 200);
    if (!trimmed) {
      throw new Error("Title cannot be empty");
    }
    const updated = await this.chatRepository.updateTitle(chatId, trimmed);
    this.logger.info({
      event: "CHAT_RENAMED",
      chatId,
      userId,
    });
    return updated;
  }

  async getConversation(chatId: string, userId: string) {
    await this.getChatById(chatId, userId);
    return this.chatRepository.getConversation(chatId);
  }

  /**
   * Non-streaming send. Kept for compatibility with the existing endpoint.
   */
  async sendMessage(
    request: SendMessageRequest
  ): Promise<SendMessageResponse> {
    await this.getChatById(request.chatId, request.userId);

    const history = await this.chatRepository.getConversation(request.chatId);

    await this.chatRepository.createMessage({
      sessionId: request.chatId,
      role: "USER",
      content: request.message,
    });

    const ragResponse = await this.ragService.generate({
      question: request.message,
      history,
      topK: DEFAULT_TOP_K,
    });

    const assistantMessage = await this.chatRepository.createMessage({
      sessionId: request.chatId,
      role: "ASSISTANT",
      content: ragResponse.answer,
    });

    if (ragResponse.citations.length > 0) {
      await this.chatRepository.createCitations(
        assistantMessage.id,
        ragResponse.citations
      );
    }

    return {
      answer: ragResponse.answer,
      citations: ragResponse.citations,
    };
  }

  /**
   * Streaming counterpart of sendMessage.
   *
   * 1. Validate ownership.
   * 2. Load history BEFORE persisting the incoming user message.
   * 3. Persist the user message.
   * 4. Delegate to RAGService.streamGenerate, forwarding events to the caller.
   * 5. When the stream ends (naturally OR via abort), persist the assistant
   *    message with the accumulated answer and its citations.
   *
   * The route layer is responsible for translating events into SSE frames.
   */
  async *streamMessage(
    request: SendMessageRequest,
    options: { signal?: AbortSignal; debug?: boolean } = {}
  ): AsyncGenerator<RAGStreamEvent, void, unknown> {
    const { signal, debug } = options;
    await this.getChatById(request.chatId, request.userId);

    const history = await this.chatRepository.getConversation(request.chatId);

    await this.chatRepository.createMessage({
      sessionId: request.chatId,
      role: "USER",
      content: request.message,
    });

    let accumulatedAnswer = "";
    let acceptedCitations: CitationReference[] = [];

    for await (const event of this.ragService.streamGenerate(
      {
        question: request.message,
        history,
        topK: DEFAULT_TOP_K,
      },
      { signal, debug }
    )) {
      if (event.type === "context") {
        acceptedCitations = event.citations;
      } else if (event.type === "token") {
        accumulatedAnswer += event.delta;
      } else if (event.type === "done") {
        // Prefer the server-side accumulated answer (in case a token was dropped
        // by a mid-stream event), fall back to our own accumulator.
        accumulatedAnswer = event.answer || accumulatedAnswer;
      }
      yield event;
    }

    // Persist final assistant message + citations even if aborted mid-stream.
    if (accumulatedAnswer.length > 0) {
      const assistantMessage = await this.chatRepository.createMessage({
        sessionId: request.chatId,
        role: "ASSISTANT",
        content: accumulatedAnswer,
      });
      if (acceptedCitations.length > 0) {
        await this.chatRepository.createCitations(
          assistantMessage.id,
          acceptedCitations
        );
      }
    }
  }
}
