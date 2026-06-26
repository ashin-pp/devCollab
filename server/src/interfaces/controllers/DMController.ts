import { Response } from 'express';
import { StartConversationUseCase } from '../../application/use-cases/dm/StartConversationUseCase';
import { GetConversationsUseCase } from '../../application/use-cases/dm/GetConversationsUseCase';
import { SendDirectMessageUseCase } from '../../application/use-cases/dm/SendDirectMessageUseCase';
import { GetDirectMessagesUseCase } from '../../application/use-cases/dm/GetDirectMessagesUseCase';
import { MarkMessageAsSeenUseCase } from '../../application/use-cases/dm/MarkMessageAsSeenUseCase';
import { ApiResponse } from '../http/helpers/implementation/apiResponse';
import { HttpStatusCode } from '../../domain/enums/HttpStatusCode';
import { SuccessMessage } from '../../domain/enums/SuccessMessage';
import { ErrorMessage } from '../../domain/enums/ErrorMessage';
import { MessageType } from '../../domain/enums/MessageType';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { AppError } from '../../domain/errors/AppError';

export class DMController {
    constructor(
        private readonly startConversationUseCase: StartConversationUseCase,
        private readonly getConversationsUseCase: GetConversationsUseCase,
        private readonly sendDirectMessageUseCase: SendDirectMessageUseCase,
        private readonly getDirectMessagesUseCase: GetDirectMessagesUseCase,
        private readonly markMessageAsSeenUseCase: MarkMessageAsSeenUseCase
    ) {}

    startConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        }

        const workspaceId = req.params.workspaceId as string;
        const { receiverId } = req.body as { receiverId: string };

        const conversation = await this.startConversationUseCase.execute(workspaceId, userId, receiverId);
        const response = ApiResponse.success(SuccessMessage.CONVERSATION_STARTED, conversation);
        res.status(HttpStatusCode.CREATED).json(response);
    };

    getConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        }

        const workspaceId = req.params.workspaceId as string;
        const conversations = await this.getConversationsUseCase.execute(workspaceId, userId);
        const response = ApiResponse.success(SuccessMessage.CONVERSATION_FETCHED, conversations);
        res.status(HttpStatusCode.OK).json(response);
    };

    getMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        }

        const conversationId = req.params.conversationId as string;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = parseInt(req.query.skip as string) || 0;

        const messages = await this.getDirectMessagesUseCase.execute(conversationId, userId, limit, skip);
        const response = ApiResponse.success(SuccessMessage.MESSAGES_FETCHED, messages);
        res.status(HttpStatusCode.OK).json(response);
    };

    sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const senderId = req.user?.id;
        if (!senderId) {
            throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        }

        const conversationId = req.params.conversationId as string;
        const { content, messageType, imageUrl } = req.body as {
            content: string;
            messageType?: MessageType;
            imageUrl?: string;
        };

        const message = await this.sendDirectMessageUseCase.execute(
            conversationId,
            senderId,
            content,
            messageType ?? MessageType.TEXT,
            imageUrl
        );
        const response = ApiResponse.success(SuccessMessage.MESSAGE_SENT, message);
        res.status(HttpStatusCode.CREATED).json(response);
    };

    markAsSeen = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        }

        const conversationId = req.params.conversationId as string;
        await this.markMessageAsSeenUseCase.execute(conversationId, userId);
        const response = ApiResponse.success(SuccessMessage.MESSAGES_MARKED_SEEN);
        res.status(HttpStatusCode.OK).json(response);
    };
}
