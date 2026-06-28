import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { SendMessageUseCase } from '../../application/use-cases/channel/SendMessageUseCase';
import { GetChannelMessagesUseCase } from '../../application/use-cases/channel/GetChannelMessagesUseCase';
import { HttpStatusCode } from '../../domain/enums/HttpStatusCode';
import { AppError } from '../../domain/errors/AppError';
import { ErrorMessage } from '../../domain/enums/ErrorMessage';

export class MessageController {
    constructor(
        private readonly sendMessageUseCase: SendMessageUseCase,
        private readonly getChannelMessagesUseCase: GetChannelMessagesUseCase
    ) {}

    sendMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { workspaceId, channelId } = req.params;
            const { content, messageType, imageUrl } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            if (!content && !imageUrl) {
                throw new AppError("Message content or image is required", HttpStatusCode.BAD_REQUEST);
            }

            const message = await this.sendMessageUseCase.execute(
                workspaceId as string, 
                channelId as string, 
                userId, 
                content || '',
                messageType,
                imageUrl
            );
            
            res.status(HttpStatusCode.CREATED).json({
                message: "Message sent successfully",
                data: message
            });
        } catch (error) {
            next(error);
        }
    };

    getChannelMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { channelId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
            }

            const messages = await this.getChannelMessagesUseCase.execute(channelId as string, page, limit);
            
            res.status(HttpStatusCode.OK).json({
                message: "Messages fetched successfully",
                data: messages
            });
        } catch (error) {
            next(error);
        }
    };
}
