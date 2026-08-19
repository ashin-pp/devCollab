import { IAPIResponse } from "../IAPIResponse";

export class ApiResponse<T> implements IAPIResponse<T> {
    private constructor(
        public success: boolean, 
        public message?: string,
        public data?: T, 
        public error?: { message: string }
    ) {}

    static success<T>(message: string, data?: T): ApiResponse<T> {
        return new ApiResponse<T>(true, message, data, undefined);
    }

    static error<T>(message: string): ApiResponse<T> {
        return new ApiResponse<T>(false, message, undefined, { message });
    }
}
