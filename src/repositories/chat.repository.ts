import { BaseRepository } from "./base.repository";

export class ChatRepository extends BaseRepository {
  async create(data: {
    title: string;
    userId: string;
  }) {
    return this.db.chatSession.create({
      data,
    });
  }

  async findById(id: string) {
    return this.db.chatSession.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string) {
    return this.db.chatSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async updateTitle(id: string,title: string) {
    return this.db.chatSession.update({
      where: { id },
      data: {
        title,
      },
    });
  }

  async delete(id: string) {
    return this.db.chatSession.delete({
      where: { id },
    });
  }
}