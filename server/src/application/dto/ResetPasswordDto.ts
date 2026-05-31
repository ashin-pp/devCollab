export interface ResetPasswordDto {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}
