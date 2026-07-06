export interface ResetPasswordRequestDto {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}
