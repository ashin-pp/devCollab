export interface IStorageService {
    uploadFile(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string>;
    getSignedUrl(fileUrl: string, expiresInSeconds?: number): Promise<string>;
    toPersistentUrl(fileUrl: string): string;
    deleteFile(fileUrl: string): Promise<void>;
}
