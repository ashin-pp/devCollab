
export interface IForgotPasswordUseCase {
    execute(payload: {email: string}): Promise<void>;
}
