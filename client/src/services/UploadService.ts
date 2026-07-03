import { api } from '../api/axios';
import { API_ENDPOINTS } from '../config/api.constants';

export class UploadService {
    static async uploadChatImage(file: File) {
        const formData = new FormData();
        formData.append('image', file);

        return api.post(API_ENDPOINTS.UPLOAD.IMAGE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
}
