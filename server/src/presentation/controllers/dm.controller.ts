import { Response } from "express";
import { inject, injectable } from 'tsyringe';
import type { IGetConversationsUseCase } from "../../application/interfaces/use-cases/dm/get-conversations.usecase.interface";
import type { IGetDirectMessagesUseCase } from "../../application/interfaces/use-cases/dm/get-direct-messages.usecase.interface";
import type { IMarkMessageAsSeenUseCase } from "../../application/interfaces/use-cases/dm/mark-message-as-seen.usecase.interface";
import type { ISendDirectMessageUseCase } from "../../application/interfaces/use-cases/dm/send-direct-message.usecase.interface";
import type { IStartConversationUseCase } from "../../application/interfaces/use-cases/dm/start-conversation.usecase.interface";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { MessageType } from "../../domain/enums/MessageType";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { AppError } from "../../domain/errors/AppError";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

@injectable()
export class DMController {
    constructor(
        @inject(USECASE_TOKENS.IStartConversationUseCase) private readonly _startConversationUseCase: IStartConversationUseCase,
        @inject(USECASE_TOKENS.IGetConversationsUseCase) private readonly _getConversationsUseCase: IGetConversationsUseCase,
        @inject(USECASE_TOKENS.ISendDirectMessageUseCase) private readonly _sendDirectMessageUseCase: ISendDirectMessageUseCase,
        @inject(USECASE_TOKENS.IGetDirectMessagesUseCase) private readonly _getDirectMessagesUseCase: IGetDirectMessagesUseCase,
        @inject(USECASE_TOKENS.IMarkMessageAsSeenUseCase) private readonly _markMessageAsSeenUseCase: IMarkMessageAsSeenUseCase
    ) {}

    startConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        }

        const workspaceId = req.params.workspaceId as string;
        const { receiverId } = req.body as { receiverId: string };

        const conversation = await this._startConversationUseCase.execute(workspaceId, userId, receiverId);
        const response = ApiResponse.success(SuccessMessage.CONVERSATION_STARTED, conversation);
        res.status(HttpStatusCode.CREATED).json(response);
    };

    getConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        }

        const workspaceId = req.params.workspaceId as string;
        const conversations = await this._getConversationsUseCase.execute(workspaceId, userId);
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

        const messages = await this._getDirectMessagesUseCase.execute(conversationId, userId, limit, skip);
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

        const message = await this._sendDirectMessageUseCase.execute(
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
        await this._markMessageAsSeenUseCase.execute(conversationId, userId);
        const response = ApiResponse.success(SuccessMessage.MESSAGES_MARKED_SEEN);
        res.status(HttpStatusCode.OK).json(response);
    };
}
