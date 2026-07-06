import { injectable, inject } from 'tsyringe';
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { UploadChatImageUseCase } from "../../application/use-cases/chat/upload-chat-image.usecase";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { AppError } from "../../domain/errors/AppError";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class UploadController {
    constructor(
        @inject(UploadChatImageUseCase) private readonly _uploadChatImageUseCase: UploadChatImageUseCase
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
