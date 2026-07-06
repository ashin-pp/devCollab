import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IDirectMessageRepository } from "../../../application/interfaces/repositories/direct-message.repository.interface";
import type { IConversationRepository } from "../../../application/interfaces/repositories/conversation.repository.interface";
import { DirectMessage } from "../../../domain/entities/direct-message.entity";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MessageType } from "../../../domain/enums/MessageType";

@injectable()
export class SendDirectMessageUseCase {
    constructor(
        @inject(TOKENS.IDirectMessageRepository) private _dmRepository: IDirectMessageRepository,
        @inject(TOKENS.IConversationRepository) private _conversationRepository: IConversationRepository
    ) {}

    async execute(
        conversationId: string,
        senderId: string,
        content: string,
        messageType: MessageType = MessageType.TEXT,
        imageUrl?: string
    ): Promise<DirectMessage> {
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
