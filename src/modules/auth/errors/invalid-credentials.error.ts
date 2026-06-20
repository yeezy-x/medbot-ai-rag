import { AuthError }
from "@/lib/errors/auth-error";

export class InvalidCredentialsError
extends AuthError {
  constructor() {
    super(
      "Invalid credentials"
    );
  }
}