import { api } from '../axios';
import { API_ENDPOINTS } from '../../config/api.constants';
import type { UpdateProfileData, ChangePasswordData } from '../../types/user.types';

export const UserService = {
    getProfile: async () => {
        const response = await api.get(API_ENDPOINTS.USER.PROFILE);
        return response.data;
    },
    
    updateProfile: async (data: UpdateProfileData) => {
        const response = await api.put(API_ENDPOINTS.USER.PROFILE, data);
        return response.data;
    },
    
    changePassword: async (data: ChangePasswordData) => {
        const response = await api.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, data);
        return response.data;
    },
    
    requestEmailChange: async (data: { newEmail: string }) => {
        const response = await api.post(API_ENDPOINTS.USER.CHANGE_EMAIL_REQUEST, data);
        return response.data;
    },
    
    verifyEmailChange: async (data: { newEmail: string; otp: string }) => {
        const response = await api.post(API_ENDPOINTS.USER.CHANGE_EMAIL_VERIFY, data);
        return response.data;
    },

    uploadProfileImage: async (file: File) => {
        const formData = new FormData();
        formData.append('profileImage', file);
        const response = await api.post(API_ENDPOINTS.USER.PROFILE_IMAGE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteProfileImage: async () => {
        const response = await api.delete(API_ENDPOINTS.USER.PROFILE_IMAGE);
        return response.data;
    },

    searchUserByEmail: async (email: string) => {
        const response = await api.get(`${API_ENDPOINTS.USER.SEARCH}?email=${encodeURIComponent(email)}`);
        return response.data;
    }
};
