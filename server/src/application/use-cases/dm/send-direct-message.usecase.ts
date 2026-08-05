import { inject, injectable } from 'tsyringe';
import type { IConversationRepository } from "../../../application/interfaces/repositories/conversation.repository.interface";
import type { IDirectMessageRepository } from "../../../application/interfaces/repositories/direct-message.repository.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import { DirectMessage } from "../../../domain/entities/direct-message.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MessageType } from "../../../domain/enums/MessageType";
import { AppError } from "../../../domain/errors/AppError";
import { ISendDirectMessageUseCase } from "../../interfaces/use-cases/dm/send-direct-message.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class SendDirectMessageUseCase implements ISendDirectMessageUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IDirectMessageRepository) private _dmRepository: IDirectMessageRepository,
        @inject(REPOSITORY_TOKENS.IConversationRepository) private _conversationRepository: IConversationRepository,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService
    ) {}

    async execute(
        conversationId: string,
        senderId: string,
        content: string,
        messageType: MessageType = MessageType.TEXT,
        imageUrl?: string
    ): Promise<DirectMessage> {
        await this._planEntitlementService.resolveForUserId(senderId);

        const conversation = await this._conversationRepository.findById(conversationId);
        if (!conversation) {
            throw new AppError(ErrorMessage.CONVERSATION_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId) {
            throw new AppError(ErrorMessage.NOT_CONVERSATION_PARTICIPANT, HttpStatusCode.FORBIDDEN);
        }

        const message = new DirectMessage(conversationId, senderId, content, false, messageType, imageUrl);
        const savedMessage = await this._dmRepository.create(message);

        await this._conversationRepository.updateLastMessageTime(conversationId, new Date());

        return savedMessage;
    }
}
