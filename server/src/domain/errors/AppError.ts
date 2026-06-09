import { HttpStatusCode } from "../enums/HttpStatusCode";

export class AppError extends Error {
    public readonly statusCode: HttpStatusCode;

    constructor(message: string, statusCode: HttpStatusCode) {
        super(message);
        this.statusCode = statusCode;
        
        // This line is required in TypeScript when extending built-in classes
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
