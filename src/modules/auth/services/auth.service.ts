import { BaseService } from "@/services/base.service";
import {
  RegisterInput,
} from "../schemas/auth.schema";

import { hashPassword }
from "../utils/password";

import { UserRepository }
from "@/repositories/user.repository";
import { RegisterDto } from "../types/auth.dto";
import { AuthError } from "@/lib/errors/auth-error";
import { EmailAlreadyExistsError } from "../errors/email-already-exists.error";

export class AuthService extends BaseService {
  private userRepository = new UserRepository();

  async register(
    input: RegisterDto
  ) {
    const existingUser =
      await this.userRepository
        .exists(input.email)

    if (existingUser) {
      throw new EmailAlreadyExistsError()
    }

    const passwordHash =
      await hashPassword(
        input.password
      );

    const user=await this.userRepository.create({
      name:input.name,
      email:input.email,
      passwordHash
    })

    this.logger.info({
      event:"USER_REGISTERED",
      userId:user.id
    })
    return user
  }
}