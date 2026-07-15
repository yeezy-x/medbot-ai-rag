import { ErrorCode } from "@/types/error.types";

export class AppError extends Error{
    constructor(
        public readonly code:ErrorCode,
        public readonly statusCode:number,
        message:string,
        public readonly details?:unknown
    ){
        super(message);
        this.name="AppError"
    }
}

//every custom error must inherit from this code. 