import { ErrorCode } from "@/types/error.types";
import { AppError } from "./app-error";

export class NotFoundError extends AppError{
    constructor(message="Resource not found."){
        super(
            ErrorCode.NOT_FOUND,
            404,
            message
        )
    }
}