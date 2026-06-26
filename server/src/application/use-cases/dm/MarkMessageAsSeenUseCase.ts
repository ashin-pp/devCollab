import { IDirectMessageRepository } from '../../../application/repositories/IDirectMessageRepository';
import { IConversationRepository } from '../../../application/repositories/IConversationRepository';
import { AppError } from '../../../domain/errors/AppError';
import { ErrorMessage } from '../../../domain/enums/ErrorMessage';
import { HttpStatusCode } from '../../../domain/enums/HttpStatusCode';

export class MarkMessageAsSeenUseCase {
    constructor(
        private dmRepository: IDirectMessageRepository,
        private conversationRepository: IConversationRepository
    ) { }

    async execute(conversationId: string, receiverId: string): Promise<void> {
        const conversation = await this.conversationRepository.findById(conversationId);
        if (!conversation) {
            throw new AppError(ErrorMessage.CONVERSATION_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }


        if (conversation.participant1Id !== receiverId && conversation.participant2Id !== receiverId) {
            throw new AppError(ErrorMessage.NOT_CONVERSATION_PARTICIPANT, HttpStatusCode.FORBIDDEN);
        }

        await this.dmRepository.markAsSeen(conversationId, receiverId);
    }
}
