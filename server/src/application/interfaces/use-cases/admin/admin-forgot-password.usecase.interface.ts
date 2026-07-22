
export interface IAdminForgotPasswordUseCase {
    execute(email: string): Promise<void>;
}
