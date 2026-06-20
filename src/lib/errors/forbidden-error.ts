import { ErrorCode } from "@/types/error.types";
import { AppError } from "./app-error";

export class ForbiddenError extends AppError{
    constructor(message="Forbidden"){
        super(
            ErrorCode.FORBIDDEN,
            403,
            message
        )
    }
}