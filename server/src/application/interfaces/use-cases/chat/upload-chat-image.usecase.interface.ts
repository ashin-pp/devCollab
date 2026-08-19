
export interface IUploadChatImageUseCase {
    execute(userId: string, fileBuffer: Buffer, fileName: string, contentType: string): Promise<string>;
}
