import { IStorageService } from "../../../application/services/IStorageService";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class UploadChatImageUseCase {
    constructor(private storageService: IStorageService) {}

    async execute(userId: string, fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
        if (!fileBuffer || !fileName || !contentType) {
            throw new AppError("Invalid file data", HttpStatusCode.BAD_REQUEST);
        }
        
        const uniqueFileName = `chat-images/${userId}-${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
        const newImageUrl = await this.storageService.uploadFile(fileBuffer, uniqueFileName, contentType);
        
        return newImageUrl;
    }
}
