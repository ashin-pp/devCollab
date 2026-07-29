import { injectable } from 'tsyringe';
import nodemailer from "nodemailer";
import { IEmailService } from "../../application/interfaces/services/email.service.interface";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { AppError } from "../../domain/errors/AppError";
import { logger } from "../../infrastructure/di/container";

@injectable()
export class NodemailerEmailService implements IEmailService {
    private _transporter;

    constructor() {
        const user = process.env.EMAIL_USER?.trim();
        const pass = process.env.EMAIL_APP_PASSWORD?.replace(/\s/g, '');

        this._transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user,
                pass
            }
        });
    }

    private getFromAddress(): string {
        const user = process.env.EMAIL_USER?.trim();
        if (!user) {
            throw new Error("EMAIL_USER is not configured on the server");
        }
        return `"DevCollab" <${user}>`;
    }

    async sendOtpEmail(email: string, otp: string): Promise<void> {
        const mailOptions = {
            from: this.getFromAddress(),
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
            await this._transporter.sendMail(mailOptions);
            logger.info(`OTP Email successfully sent to ${email}`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to send OTP email to ${email}: ${errorMessage}`);
            throw new AppError(ErrorMessage.EMAIL_SEND_FAILED, HttpStatusCode.INTERNAL_SERVER);
        }
    }

    async sendWorkspaceInviteEmail(email: string, workspaceName: string, inviteLink: string): Promise<void> {
        const mailOptions = {
            from: this.getFromAddress(),
            to: email,
            subject: `You've been invited to join ${workspaceName} on DevCollab!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>You're Invited!</h2>
                    <p>You have been invited to join the workspace <strong>${workspaceName}</strong> on DevCollab.</p>
                    <p>Click the link below to accept the invitation and join the team:</p>
                    <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;">
                        Join Workspace
                    </a>
                    <p style="margin-top: 24px; font-size: 14px; color: #666;">If you don't have a DevCollab account yet, use the link to create one — then you'll be able to join this workspace.</p>
                </div>
            `
        };

        try {
            await this._transporter.sendMail(mailOptions);
            logger.info(`Workspace Invite Email successfully sent to ${email}`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to send invite email to ${email}: ${errorMessage}`);
            throw new Error(`Failed to send invite email: ${errorMessage}`);
        }
    }
}
