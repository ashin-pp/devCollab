import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { SendOtpUseCase } from "./send-otp.usecase";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class ForgotPasswordUseCase implements IBaseUseCase<{email: string}, void> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(SendOtpUseCase) private _sendOtpUseCase: SendOtpUseCase
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
