import { NextFunction, Response } from "express";
import { inject, injectable } from 'tsyringe';
import type { IUploadChatImageUseCase } from "../../application/interfaces/use-cases/chat/upload-chat-image.usecase.interface";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { AppError } from "../../domain/errors/AppError";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class UploadController {
    constructor(
        @inject(USECASE_TOKENS.IUploadChatImageUseCase) private readonly _uploadChatImageUseCase: IUploadChatImageUseCase
    ) {}

    public uploadChatImage = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const file = req.file;
        if (!userId) {
                        throw new AppError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
                    }
        if (!file) {
                        throw new AppError("No file uploaded", HttpStatusCode.BAD_REQUEST);
                    }
        const imageUrl = await this._uploadChatImageUseCase.execute(
                        userId,
                        file.buffer,
                        file.originalname,
                        file.mimetype
                    );
        res.status(HttpStatusCode.OK).json({
                        message: "Image uploaded successfully",
                        data: {
                            imageUrl
                        }
                    });
        });
}
