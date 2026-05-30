export interface IAPIResponse<T> {
    success: boolean;
    data?: T;
    error?: { message: string };
}
