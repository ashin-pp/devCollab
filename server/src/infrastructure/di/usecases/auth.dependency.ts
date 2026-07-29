import { container } from 'tsyringe';
import { USECASE_TOKENS } from "../usecase.tokens";
import { ForgotPasswordUseCase } from "../../../application/use-cases/auth/forgot-password.usecase";
import { GoogleAuthUseCase } from "../../../application/use-cases/auth/google-auth.usecase";
import { LoginUserUseCase } from "../../../application/use-cases/auth/login-user.usecase";
import { RefreshTokenUseCase } from "../../../application/use-cases/auth/refresh-token.usecase";
import { RegisterUserUseCase } from "../../../application/use-cases/auth/register-user.usecase";
import { ResetPasswordUseCase } from "../../../application/use-cases/auth/reset-password.usecase";
import { SendOtpUseCase } from "../../../application/use-cases/auth/send-otp.usecase";
import { VerifyOtpUseCase } from "../../../application/use-cases/auth/verify-otp.usecase";
import { VerifyResetOtpUseCase } from "../../../application/use-cases/auth/verify-reset-otp.usecase";

export function registerAuthUseCases() {
    container.register(USECASE_TOKENS.IForgotPasswordUseCase, { useClass: ForgotPasswordUseCase });
    container.register(USECASE_TOKENS.IGoogleAuthUseCase, { useClass: GoogleAuthUseCase });
    container.register(USECASE_TOKENS.ILoginUserUseCase, { useClass: LoginUserUseCase });
    container.register(USECASE_TOKENS.IRefreshTokenUseCase, { useClass: RefreshTokenUseCase });
    container.register(USECASE_TOKENS.IRegisterUserUseCase, { useClass: RegisterUserUseCase });
    container.register(USECASE_TOKENS.IResetPasswordUseCase, { useClass: ResetPasswordUseCase });
    container.register(USECASE_TOKENS.ISendOtpUseCase, { useClass: SendOtpUseCase });
    container.register(USECASE_TOKENS.IVerifyOtpUseCase, { useClass: VerifyOtpUseCase });
    container.register(USECASE_TOKENS.IVerifyResetOtpUseCase, { useClass: VerifyResetOtpUseCase });
}
