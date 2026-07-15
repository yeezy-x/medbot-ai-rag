import { AuthError } from "@/lib/errors/auth-error";

export class EmailAlreadyExistsError extends AuthError {
  constructor() {
    super(
      "Email already exists"
    );
  }
}