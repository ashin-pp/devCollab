import { injectable } from 'tsyringe';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { IStorageService } from "../../application/interfaces/services/storage.service.interface";
import { envConfig } from "../../config/envConfig";

@injectable()
export class AwsS3StorageService implements IStorageService {
    private s3Client: S3Client;
    private bucketName: string;

    constructor() {
        const { awsAccessKeyId, awsSecretAccessKey, awsRegion, awsS3BucketName } = envConfig;

        if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion || !awsS3BucketName) {
            console.warn("AWS S3 credentials are not fully configured in environment variables.");
        }

        this.bucketName = awsS3BucketName || '';
        
        this.s3Client = new S3Client({
            region: awsRegion || 'us-east-1',
            credentials: {
                accessKeyId: awsAccessKeyId || '',
                secretAccessKey: awsSecretAccessKey || '',
            }
        });
    }

    async uploadFile(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
        const key = `devcollab/profiles/${Date.now()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        });

        await this.s3Client.send(command);

        return `https://${this.bucketName}.s3.${envConfig.awsRegion || 'us-east-1'}.amazonaws.com/${key}`;
    }

    async deleteFile(fileUrl: string): Promise<void> {
        if (!fileUrl) return;

        try {
            const urlParts = fileUrl.split('.amazonaws.com/');
            if (urlParts.length !== 2) return;
            
            const key = urlParts[1];

            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
        } catch (error) {
            console.error("Failed to delete S3 image:", error);
        }
    }
}
