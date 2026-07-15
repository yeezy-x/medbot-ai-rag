import { UserRepository } from "@/repositories";
import { BaseService } from "@/services/base.service";


export class UserService extends BaseService{

  private userRepository = new UserRepository();

  async getUserById(id: string) {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
}