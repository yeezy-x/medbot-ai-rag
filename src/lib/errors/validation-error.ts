import { ErrorCode } from "@/types/error.types";
import { AppError } from "./app-error";

export class ValidationError extends AppError{
    constructor(message="Validation Failed"){
        super(
            ErrorCode.VALIDATION_ERROR,
            401,
            message
        )
    }
}