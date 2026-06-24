import { IDirectMessageRepository } from '../../../application/repositories/IDirectMessageRepository';
import { IConversationRepository } from '../../../application/repositories/IConversationRepository';
import { DirectMessage } from '../../../domain/entities/DirectMessage';
import { AppError } from '../../../domain/errors/AppError';
import { ErrorMessage } from '../../../domain/enums/ErrorMessage';
import { HttpStatusCode } from '../../../domain/enums/HttpStatusCode';
import { MessageType } from '../../../domain/enums/MessageType';

export class SendDirectMessageUseCase {
    constructor(
        private dmRepository: IDirectMessageRepository,
        private conversationRepository: IConversationRepository
    ) {}

    async execute(
        conversationId: string,
        senderId: string,
        content: string,
        messageType: MessageType = MessageType.TEXT,
        imageUrl?: string
    ): Promise<DirectMessage> {
        const conversation = await this.conversationRepository.findById(conversationId);
        if (!conversation) {
            throw new AppError(ErrorMessage.CONVERSATION_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId) {
            throw new AppError(ErrorMessage.NOT_CONVERSATION_PARTICIPANT, HttpStatusCode.FORBIDDEN);
        }

        const message = new DirectMessage(conversationId, senderId, content, false, messageType, imageUrl);
        const savedMessage = await this.dmRepository.create(message);

        await this.conversationRepository.updateLastMessageTime(conversationId, new Date());

        return savedMessage;
    }
}
