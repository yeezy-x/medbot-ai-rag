import { BaseService } from "@/services/base.service";

import { comparePassword, hashPassword }
from "../utils/password";

import { UserRepository }
from "@/repositories/user.repository";
import { LoginDto, RegisterDto } from "../types/auth.dto";
import { EmailAlreadyExistsError } from "../errors/email-already-exists.error";
import { ValidationError } from "@/lib/errors/validation-error";

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

  async login(input:LoginDto){
    const user=await this.userRepository.findByEmail(input.email);
    if(!user){
      throw new ValidationError("Invalid Credentials")
    }
    const isValidPassword=await comparePassword(input.password,user.passwordHash)
    if(!isValidPassword){
      throw new ValidationError("Invalid Credentials")
    }
    this.logger.info({
      event:"USER_LOGGED_IN",
      userId:user.id
    })
    return user
  }
}