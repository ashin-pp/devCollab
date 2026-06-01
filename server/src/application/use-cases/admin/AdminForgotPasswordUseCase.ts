import { IAdminRepository } from "../../repositories/IAdminRepository";
import { SendOtpUseCase } from "../auth/SendOtpUseCase";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class AdminForgotPasswordUseCase {
    constructor(
        private adminRepository: IAdminRepository,
        private sendOtpUseCase: SendOtpUseCase
    ) { }

    async execute(email: string): Promise<void> {
        const admin = await this.adminRepository.findByEmail(email);
        
        if (!admin) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        await this.sendOtpUseCase.execute(email);
    }
}
