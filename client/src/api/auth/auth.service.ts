import { api } from "../axios"
import { API_ENDPOINTS } from '../../config/api.constants';
import type { RegisterData, LoginData, ResetPasswordData } from '../../types/auth.types';

export const AuthService = {
    login: async (data: LoginData) => {
        const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, data)
        return response.data
    },
    googleAuth: async (token: string) => {
        const response = await api.post(API_ENDPOINTS.AUTH.GOOGLE, { token })
        return response.data
    },
    register: async (data: RegisterData) => {
        const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, data)
        return response.data
    },
    logout: async () => {
        const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT)
        return response.data
    },
    refresh: async () => {
        const response = await api.get(API_ENDPOINTS.AUTH.REFRESH)
        return response.data
    },
    sendOtp: async (email: string) => {
        const response = await api.post(API_ENDPOINTS.AUTH.SEND_OTP, { email })
        return response.data
    },
    verifyOtp: async (email: string, otp: string) => {
        const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp })
        return response.data
    },
    forgotPassword: async (email: string) => {
        const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
        return response.data
    },
    verifyResetOtp: async (email: string, otp: string) => {
        const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_RESET_OTP, { email, otp })
        return response.data
    },
    resetPassword: async (data: ResetPasswordData) => {
        const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data)
        return response.data
    }
}