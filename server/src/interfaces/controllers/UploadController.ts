import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { UploadChatImageUseCase } from '../../application/use-cases/chat/UploadChatImageUseCase';
import { HttpStatusCode } from '../../domain/enums/HttpStatusCode';
import { AppError } from '../../domain/errors/AppError';

export class UploadController {
    constructor(private readonly uploadChatImageUseCase: UploadChatImageUseCase) {}

    public uploadChatImage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const file = req.file;

            if (!userId) {
                throw new AppError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
            }

            if (!file) {
                throw new AppError("No file uploaded", HttpStatusCode.BAD_REQUEST);
            }

            const imageUrl = await this.uploadChatImageUseCase.execute(
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
        } catch (error) {
            next(error);
        }
    };
}
