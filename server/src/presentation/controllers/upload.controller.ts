import { Response } from "express";
import { inject, injectable } from "tsyringe";
import type { IUploadChatImageUseCase } from "../../application/interfaces/use-cases/chat/upload-chat-image.usecase.interface";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { AppError } from "../../domain/errors/AppError";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";
import { requireUserId } from "../utils/require-user-id";

@injectable()
export class UploadController {
    constructor(
        @inject(USECASE_TOKENS.IUploadChatImageUseCase)
        private readonly _uploadChatImageUseCase: IUploadChatImageUseCase
    ) {}

    uploadChatImage = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const file = req.file;
        if (!file) {
            throw new AppError(ErrorMessage.NO_FILE_UPLOADED, HttpStatusCode.BAD_REQUEST);
        }
        const imageUrl = await this._uploadChatImageUseCase.execute(
            userId,
            file.buffer,
            file.originalname,
            file.mimetype
        );
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.IMAGE_UPLOADED, { imageUrl })
        );
    });
}
