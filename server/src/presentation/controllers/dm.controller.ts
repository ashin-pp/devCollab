import { Response } from "express";
import { inject, injectable } from "tsyringe";
import type { IGetConversationsUseCase } from "../../application/interfaces/use-cases/dm/get-conversations.usecase.interface";
import type { IGetDirectMessagesUseCase } from "../../application/interfaces/use-cases/dm/get-direct-messages.usecase.interface";
import type { IMarkMessageAsSeenUseCase } from "../../application/interfaces/use-cases/dm/mark-message-as-seen.usecase.interface";
import type { ISendDirectMessageUseCase } from "../../application/interfaces/use-cases/dm/send-direct-message.usecase.interface";
import type { IStartConversationUseCase } from "../../application/interfaces/use-cases/dm/start-conversation.usecase.interface";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { MessageType } from "../../domain/enums/MessageType";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";
import { requireUserId } from "../utils/require-user-id";

@injectable()
export class DMController {
    constructor(
        @inject(USECASE_TOKENS.IStartConversationUseCase)
        private readonly _startConversationUseCase: IStartConversationUseCase,
        @inject(USECASE_TOKENS.IGetConversationsUseCase)
        private readonly _getConversationsUseCase: IGetConversationsUseCase,
        @inject(USECASE_TOKENS.ISendDirectMessageUseCase)
        private readonly _sendDirectMessageUseCase: ISendDirectMessageUseCase,
        @inject(USECASE_TOKENS.IGetDirectMessagesUseCase)
        private readonly _getDirectMessagesUseCase: IGetDirectMessagesUseCase,
        @inject(USECASE_TOKENS.IMarkMessageAsSeenUseCase)
        private readonly _markMessageAsSeenUseCase: IMarkMessageAsSeenUseCase
    ) {}

    startConversation = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const workspaceId = req.params.workspaceId as string;
        const { receiverId } = req.body as { receiverId: string };
        const conversation = await this._startConversationUseCase.execute(
            workspaceId,
            userId,
            receiverId
        );
        res.status(HttpStatusCode.CREATED).json(
            ApiResponse.success(SuccessMessage.CONVERSATION_STARTED, conversation)
        );
    });

    getConversations = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const workspaceId = req.params.workspaceId as string;
        const conversations = await this._getConversationsUseCase.execute(workspaceId, userId);
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.CONVERSATION_FETCHED, conversations)
        );
    });

    getMessages = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const conversationId = req.params.conversationId as string;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = parseInt(req.query.skip as string) || 0;
        const messages = await this._getDirectMessagesUseCase.execute(
            conversationId,
            userId,
            limit,
            skip
        );
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.MESSAGES_FETCHED, messages)
        );
    });

    sendMessage = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const senderId = requireUserId(req);
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
        res.status(HttpStatusCode.CREATED).json(
            ApiResponse.success(SuccessMessage.MESSAGE_SENT, message)
        );
    });

    markAsSeen = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const userId = requireUserId(req);
        const conversationId = req.params.conversationId as string;
        await this._markMessageAsSeenUseCase.execute(conversationId, userId);
        res.status(HttpStatusCode.OK).json(
            ApiResponse.success(SuccessMessage.MESSAGES_MARKED_SEEN)
        );
    });
}
