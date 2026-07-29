export interface IEmailService {
    sendOtpEmail(email: string, otp: string): Promise<void>;
    sendWorkspaceInviteEmail(email: string, workspaceName: string, inviteLink: string): Promise<void>;
}
