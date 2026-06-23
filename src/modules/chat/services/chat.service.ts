import {
  ChatRepository,
} from "@/repositories";

import {
  NotFoundError,
} from "@/lib/errors/not-found-error";

import {
  BaseService,
} from "@/services/base.service";
import { ForbiddenError } from "@/lib/errors/forbidden-error";

export class ChatService
extends BaseService {

  private chatRepository =
    new ChatRepository();

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
      userId,
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

  async getChatById(chatId:string, userId:string){
    const chat=await this.chatRepository.findByIdAndUserId(chatId,userId);
    if(!chat){
      throw new NotFoundError("Chat not found.")
    }
    if(chat.userId!==userId){
      throw new ForbiddenError()
    }
    return chat;
  }

  async getUserChats(
    userId: string
  ) {
    return this.chatRepository
      .findByUserId(userId);
  }

  async deleteChat(chatId:string,userId:string){
    const chat=await this.getChatById(chatId,userId);
    await this.chatRepository.delete(chat.id);
    return{
      deleted:true
    }
  }
}