export interface RegisterData {
    name: string
    email: string
    password?: string
    confirmPassword?: string
}

export interface LoginData {
    email: string
    password: string
}

export interface ResetPasswordData {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
    status?: string;
    subscriptionStatus?: string;
    planId?: string | null;
    planName?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    isVerified?: boolean;
    isBlocked?: boolean;
    createdAt?: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
}
