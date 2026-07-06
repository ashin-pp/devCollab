import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IStorageService } from "../../../application/interfaces/services/storage.service.interface";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

@injectable()
export class UploadChatImageUseCase {
    constructor(
        @inject(TOKENS.IStorageService) private _storageService: IStorageService
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
