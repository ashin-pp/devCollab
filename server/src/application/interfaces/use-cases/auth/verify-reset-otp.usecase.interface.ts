
export interface IVerifyResetOtpUseCase {
    execute(payload: {email: string, otp: string}): Promise<void>;
}
