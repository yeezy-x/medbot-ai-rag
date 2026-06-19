export class AppError extends Error{
    constructor(
        public code:string,
        public statusCode:string,
        message:string
    ){
        super(message)
    }
}