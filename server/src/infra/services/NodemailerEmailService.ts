import nodemailer from "nodemailer";
import { IEmailService } from "../../domain/services/IEmailService";
import { logger } from "../../container";

export class NodemailerEmailService implements IEmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });
    }

    async sendOtpEmail(email: string, otp: string): Promise<void> {
        const mailOptions = {
            from: `"DevCollab" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your DevCollab Verification Code",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to DevCollab!</h2>
                    <p>Your one-time verification code is:</p>
                    <h1 style="font-size: 40px; letter-spacing: 5px; color: #4F46E5;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`OTP Email successfully sent to ${email}`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to send email to ${email}:`, { error: errorMessage });
            throw new Error("Failed to send email. Please try again later.");
        }
    }
}
