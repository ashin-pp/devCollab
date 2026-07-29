
export interface ISendOtpUseCase {
    execute(payload: {email: string}): Promise<void>;
}
