import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { IForgotPasswordUseCase } from "../../interfaces/use-cases/auth/forgot-password.usecase.interface";
import type { ISendOtpUseCase } from "../../interfaces/use-cases/auth/send-otp.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(USECASE_TOKENS.ISendOtpUseCase) private _sendOtpUseCase: ISendOtpUseCase
    ) { }

    async execute(payload: {email: string}): Promise<void> {
        const { email } = payload;
        const user = await this._userRepository.findByEmail(email);
        
        if (!user) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        await this._sendOtpUseCase.execute({email});
    }
}
