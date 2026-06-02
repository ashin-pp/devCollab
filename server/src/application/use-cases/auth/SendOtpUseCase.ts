import { IOtpRepository } from "../../repositories/IOtpRepository";
import { IEmailService } from "../../services/IEmailService";
import { OtpVerification } from "../../../domain/entities/OtpVerification";

export class SendOtpUseCase {
    constructor(
        private otpRepository: IOtpRepository,
        private emailService: IEmailService
    ) {}

    async execute(email: string): Promise<void> {
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        const newOtp = new OtpVerification(
            email,
            otpCode,
            expiresAt
        );

        await this.otpRepository.deleteByEmail(email);
        await this.otpRepository.create(newOtp);
        await this.emailService.sendOtpEmail(email, otpCode);
    }
}
