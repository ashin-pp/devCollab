import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { injectable } from 'tsyringe';
import { IStorageService } from "../../application/interfaces/services/storage.service.interface";
import { envConfig } from "../../config/envConfig";

const SIGNED_URL_EXPIRES_SECONDS = 60 * 60;

@injectable()
export class AwsS3StorageService implements IStorageService {
    private s3Client: S3Client;
    private bucketName: string;
    private region: string;

    constructor() {
        const { awsAccessKeyId, awsSecretAccessKey, awsRegion, awsS3BucketName } = envConfig;

        if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion || !awsS3BucketName) {
            console.warn("AWS S3 credentials are not fully configured in environment variables.");
        }

        this.bucketName = awsS3BucketName || '';
        this.region = awsRegion || 'us-east-1';

        this.s3Client = new S3Client({
            region: this.region,
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

        return this.getSignedUrl(this.toCanonicalUrl(key));
    }

    async getSignedUrl(fileUrl: string, expiresInSeconds = SIGNED_URL_EXPIRES_SECONDS): Promise<string> {
        const key = this.extractKey(fileUrl);
        if (!key || !this.bucketName) {
            return this.toPersistentUrl(fileUrl);
        }

        return getSignedUrl(
            this.s3Client,
            new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            }),
            { expiresIn: expiresInSeconds }
        );
    }

    toPersistentUrl(fileUrl: string): string {
        if (!fileUrl) return fileUrl;
        return fileUrl.split("?")[0] ?? fileUrl;
    }

    async deleteFile(fileUrl: string): Promise<void> {
        if (!fileUrl) return;

        try {
            const key = this.extractKey(fileUrl);
            if (!key) return;

            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
        } catch (error) {
            console.error("Failed to delete S3 image:", error);
        }
    }

    private toCanonicalUrl(key: string): string {
        return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    }

    private extractKey(fileUrl: string): string | null {
        if (!fileUrl) return null;
        const withoutQuery = fileUrl.split("?")[0] ?? fileUrl;
        const marker = ".amazonaws.com/";
        const idx = withoutQuery.indexOf(marker);
        if (idx === -1) {
            return withoutQuery.startsWith("http") ? null : withoutQuery.replace(/^\//, "");
        }
        return withoutQuery.slice(idx + marker.length) || null;
    }
}
