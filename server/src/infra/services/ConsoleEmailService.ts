import { IEmailService } from "../../application/services/IEmailService";
import { logger } from "../../container";

export class ConsoleEmailService implements IEmailService {
    async sendOtpEmail(email: string, otp: string): Promise<void> {
        logger.info(`📧 MOCK EMAIL SENT TO: ${email} | 🔑 OTP CODE: ${otp}`);
    }
}
