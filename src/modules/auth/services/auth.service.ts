import {
  RegisterInput,
} from "../schemas/auth.schema";

import { hashPassword }
from "../utils/password";

import { UserRepository }
from "@/repositories/user.repository";

export class AuthService {
  private userRepository =
    new UserRepository();

  async register(
    input: RegisterInput
  ) {
    const existingUser =
      await this.userRepository
        .findByEmail(input.email);

    if (existingUser) {
      throw new Error(
        "Email already exists"
      );
    }

    const passwordHash =
      await hashPassword(
        input.password
      );

    return this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });
  }
}