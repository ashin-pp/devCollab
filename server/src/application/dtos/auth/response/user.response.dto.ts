export interface UserResponseDto {
    id: string;
    name: string;
    email: string;
    role?: string;
    profileImage?: string;
    status: string;
    isVerified: boolean;
    createdAt?: Date;
}
