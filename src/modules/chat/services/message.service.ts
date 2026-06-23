// src/modules/chat/services/message.service.ts
import { MessageRole } from "@/generated/enums";
import { MessageRepository } from "@/repositories";
import { BaseService } from "@/services/base.service";

export class MessageService extends BaseService {
  private messageRepository = new MessageRepository();

  async createUserMessage(sessionId: string, content: string) {
    const message=this.messageRepository.create({
      role: MessageRole.USER,
      content,
      sessionId,
    });
    this.logger.info({
      event: "MESSAGE_CREATED",
      role: "USER",
      sessionId,
      messageId: (await message).id,
    })
    return message
  }

  async createAssistantMessage(sessionId: string, content: string) {
    const message=this.messageRepository.create({
      role: MessageRole.ASSISTANT,
      content,
      sessionId,
    });
    this.logger.info({
      event: "MESSAGE_CREATED",
      role: "USER",
      sessionId,
      messageId: (await message).id
    })
  }

  async getConversation(sessionId: string) {
    return this.messageRepository.findBySessionId(sessionId);
  }
}