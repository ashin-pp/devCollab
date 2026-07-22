import { NextFunction, Response } from "express";
import { inject, injectable } from 'tsyringe';
import type { IGetChannelMessagesUseCase } from "../../application/interfaces/use-cases/channel/get-channel-messages.usecase.interface";
import type { ISendMessageUseCase } from "../../application/interfaces/use-cases/channel/send-message.usecase.interface";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { AppError } from "../../domain/errors/AppError";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class MessageController {
    constructor(
        @inject(USECASE_TOKENS.ISendMessageUseCase) private readonly _sendMessageUseCase: ISendMessageUseCase,
        @inject(USECASE_TOKENS.IGetChannelMessagesUseCase) private readonly _getChannelMessagesUseCase: IGetChannelMessagesUseCase
    ) {}

    sendMessage = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { workspaceId, channelId } = req.params;
        const { content, messageType, imageUrl, mentionedUserIds } = req.body;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        if (!content && !imageUrl) {
                        throw new AppError("Message content or image is required", HttpStatusCode.BAD_REQUEST);
                    }
        const message = await this._sendMessageUseCase.execute({
                        workspaceId: workspaceId as string, 
                        channelId: channelId as string, 
                        senderId: userId, 
                        content: content || '',
                        messageType,
                        imageUrl,
                        mentionedUserIds
                    });
        res.status(HttpStatusCode.CREATED).json({
                        message: "Message sent successfully",
                        data: message
                    });
        });

    getChannelMessages = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { channelId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const userId = req.user?.id;
        if (!userId) {
                        throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
                    }
        const messages = await this._getChannelMessagesUseCase.execute({channelId: channelId as string, page, limit});
        res.status(HttpStatusCode.OK).json({
                        message: "Messages fetched successfully",
                        data: messages
                    });
        });
}
