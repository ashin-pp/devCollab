import { api } from "../axios"

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
export const AuthService = {
    login: async (data: LoginData) => {
        const response = await api.post('/auth/login', data)
        return response.data
    },
    register: async (data: RegisterData) => {
        const response = await api.post('/auth/register', data)
        return response.data
    },
    logout: async () => {
        const response = await api.post('/auth/logout')
        return response.data
    },
    refresh: async () => {
        const response = await api.get('/auth/refresh')
        return response.data
    },
    sendOtp: async (email: string) => {
        const response = await api.post('/auth/send-otp', { email })
        return response.data
    },
    verifyOtp: async (email: string, otp: string) => {
        const response = await api.post('/auth/verify-otp', { email, otp })
        return response.data
    },
    forgotPassword: async (email: string) => {
        const response = await api.post('/auth/forgot-password', { email })
        return response.data
    },
    verifyResetOtp: async (email: string, otp: string) => {
        const response = await api.post('/auth/verify-reset-otp', { email, otp })
        return response.data
    },
    resetPassword: async (data: ResetPasswordData) => {
        const response = await api.post('/auth/reset-password', data)
        return response.data
    }
}