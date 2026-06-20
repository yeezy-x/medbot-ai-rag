import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository{
  async findByEmail(email: string) {
    return this.db.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id:string){
    return this.db.user.findUnique({
      where:{id}
    })
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return this.db.user.create({
      data,
    });
  }

  async exists(email:string){
    const user=await this.findByEmail(email);
    return !!user
  }
}