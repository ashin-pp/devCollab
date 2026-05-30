import { IAPIResponse } from '../IAPIResponse';

export class ApiResponse<T> implements IAPIResponse<T> {
    private constructor(
        public success: boolean, 
        public data?: T, 
        public error?: { message: string }
    ) {}

    static success<T>(data: T): ApiResponse<T> {
        return new ApiResponse<T>(true, data, undefined);
    }

    static error<T>(message: string): ApiResponse<T> {
        return new ApiResponse<T>(false, undefined, { message });
    }
}
