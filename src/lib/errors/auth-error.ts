import { ErrorCode } from "@/types/error.types";
import { AppError } from "./app-error";

export class AuthError extends AppError{
    constructor(message="Unauthorized"){
        super(
            ErrorCode.AUTH_ERROR,
            400,
            message
        )
    }
}