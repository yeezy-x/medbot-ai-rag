import { ErrorCode } from "@/types/error.types";
import { AppError } from "./app-error";

export class DatabaseError extends AppError{
    constructor(message="Database operation failed."){
        super(
            ErrorCode.DATABASE_ERROR,
            500,
            message
        )
    }
}