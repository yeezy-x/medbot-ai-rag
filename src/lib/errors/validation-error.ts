import { ErrorCode } from "@/types/error.types";
import { AppError } from "./app-error";

export class ValidationError extends AppError{
    constructor(message:string,details?:unknown){
        super(
            ErrorCode.VALIDATION_ERROR,
            400,
            message,
            details
        )
    }
}