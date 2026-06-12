import { api } from '../axios';

export interface UpdateProfileData {
    name?: string;
    bio?: string;
    skills?: string[];
    github?: string;
    linkedin?: string;
    twitter?: string;
    profileImage?: string;
    location?: string;
    email?: string;
    title?: string;
}

export interface ChangePasswordData {
    currentPassword?: string;
    newPassword?: string;
}

export const UserService = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },
    
    updateProfile: async (data: UpdateProfileData) => {
        const response = await api.put('/users/profile', data);
        return response.data;
    },
    
    changePassword: async (data: ChangePasswordData) => {
        const response = await api.post('/users/change-password', data);
        return response.data;
    },
    
    requestEmailChange: async (data: { newEmail: string }) => {
        const response = await api.post('/users/change-email/request', data);
        return response.data;
    },
    
    verifyEmailChange: async (data: { newEmail: string; otp: string }) => {
        const response = await api.post('/users/change-email/verify', data);
        return response.data;
    },

    uploadProfileImage: async (file: File) => {
        const formData = new FormData();
        formData.append('profileImage', file);
        const response = await api.post('/users/profile/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteProfileImage: async () => {
        const response = await api.delete('/users/profile/image');
        return response.data;
    }
};
