export interface IStorageService {
    uploadFile(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
}
