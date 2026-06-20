import {
  MessageRole,
} from "@prisma/client";

import {
  MessageRepository,
} from "@/repositories";

import {
  BaseService,
} from "@/services/base.service";

export class MessageService
extends BaseService {

  private messageRepository =
    new MessageRepository();

  async createUserMessage(
    sessionId: string,
    content: string
  ) {
    return this.messageRepository.create({
      role: MessageRole.USER,
      content,
      sessionId,
    });
  }

  async createAssistantMessage(
    sessionId: string,
    content: string
  ) {
    return this.messageRepository.create({
      role:
        MessageRole.ASSISTANT,
      content,
      sessionId,
    });
  }

  async getConversation(
    sessionId: string
  ) {
    return this.messageRepository
      .findBySessionId(sessionId);
  }
}