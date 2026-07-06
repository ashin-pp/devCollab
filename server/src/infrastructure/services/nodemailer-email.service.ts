import { injectable } from 'tsyringe';
import nodemailer from "nodemailer";
import { IEmailService } from "../../application/interfaces/services/email.service.interface";
import { logger } from "../../infrastructure/di/container";

@injectable()
export class NodemailerEmailService implements IEmailService {
    private _transporter;

    constructor() {
        this._transporter = nodemailer.createTransport({
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
            await this._transporter.sendMail(mailOptions);
            logger.info(`OTP Email successfully sent to ${email}`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to send email to ${email}:`, { error: errorMessage });
            throw new Error("Failed to send email. Please try again later.");
        }
    }

    async sendWorkspaceInviteEmail(email: string, workspaceName: string, inviteLink: string): Promise<void> {
        const mailOptions = {
            from: `"DevCollab" <${process.env.EMAIL_USER}>`,
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
                    <p style="margin-top: 24px; font-size: 14px; color: #666;">If you don't have an account, you will be prompted to create one first.</p>
                </div>
            `
        };

        try {
            await this._transporter.sendMail(mailOptions);
            logger.info(`Workspace Invite Email successfully sent to ${email}`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to send invite email to ${email}:`, { error: errorMessage });
            throw new Error("Failed to send invite email. Please try again later.");
        }
    }
}
