import { IUserRepository } from "../../repositories/IUserRepository";
import { SendOtpUseCase } from "./SendOtpUseCase";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class ForgotPasswordUseCase {
    constructor(
        private userRepository: IUserRepository,
        private sendOtpUseCase: SendOtpUseCase
    ) { }

    async execute(email: string): Promise<void> {
        const user = await this.userRepository.findByEmail(email);
        
        if (!user) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        await this.sendOtpUseCase.execute(email);
    }
}
