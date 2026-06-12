import { v2 as cloudinary } from 'cloudinary';
import { IStorageService } from '../../domain/services/IStorageService';
import { envConfig } from '../config/envConfig';

export class CloudinaryStorageService implements IStorageService {
    constructor() {
        const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = envConfig;

        if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
            console.warn("Cloudinary credentials are not fully configured in environment variables.");
        }

        cloudinary.config({
            cloud_name: cloudinaryCloudName,
            api_key: cloudinaryApiKey,
            api_secret: cloudinaryApiSecret,
        });
    }

    async uploadFile(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'devcollab/profiles' },
                (error, result) => {
                    if (result) {
                        resolve(result.secure_url);
                    } else {
                        reject(error);
                    }
                }
            );

            uploadStream.end(fileBuffer);
        });
    }

    async deleteFile(fileUrl: string): Promise<void> {
        if (!fileUrl) return;

        try {
            const urlParts = fileUrl.split('/');
            const filenameWithExt = urlParts[urlParts.length - 1];
            const filename = filenameWithExt.split('.')[0];
            const publicId = `devcollab/profiles/${filename}`;

            await cloudinary.uploader.destroy(publicId);
            
        } catch (error) {
            console.error("Failed to delete Cloudinary image:", error);
        }
    }
}
