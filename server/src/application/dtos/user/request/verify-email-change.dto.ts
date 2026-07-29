export interface VerifyEmailChangeRequestDto {
    userId: string;
    newEmail: string;
    otp: string;
}
