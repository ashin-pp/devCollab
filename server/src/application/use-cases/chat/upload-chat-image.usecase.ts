import { inject, injectable } from 'tsyringe';
import type { IStorageService } from "../../../application/interfaces/services/storage.service.interface";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { IUploadChatImageUseCase } from "../../interfaces/use-cases/chat/upload-chat-image.usecase.interface";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class UploadChatImageUseCase implements IUploadChatImageUseCase {
    constructor(
        @inject(SERVICE_TOKENS.IStorageService) private _storageService: IStorageService
    ) {}

    async execute(userId: string, fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
        if (!fileBuffer || !fileName || !contentType) {
            throw new AppError("Invalid file data", HttpStatusCode.BAD_REQUEST);
        }
        
        const uniqueFileName = `chat-images/${userId}-${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
        const newImageUrl = await this._storageService.uploadFile(fileBuffer, uniqueFileName, contentType);
        
        return newImageUrl;
    }
}
