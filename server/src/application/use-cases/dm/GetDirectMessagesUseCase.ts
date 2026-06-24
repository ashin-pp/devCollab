import { IDirectMessageRepository } from '../../../application/repositories/IDirectMessageRepository';
import { IConversationRepository } from '../../../application/repositories/IConversationRepository';
import { DirectMessage } from '../../../domain/entities/DirectMessage';
import { AppError } from '../../../domain/errors/AppError';
import { ErrorMessage } from '../../../domain/enums/ErrorMessage';
import { HttpStatusCode } from '../../../domain/enums/HttpStatusCode';

export class GetDirectMessagesUseCase {
    constructor(
        private dmRepository: IDirectMessageRepository,
        private conversationRepository: IConversationRepository
    ) {}

    async execute(conversationId: string, userId: string, limit: number = 50, skip: number = 0): Promise<DirectMessage[]> {
        const conversation = await this.conversationRepository.findById(conversationId);
        if (!conversation) {
            throw new AppError(ErrorMessage.CONVERSATION_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
            throw new AppError(ErrorMessage.NOT_CONVERSATION_PARTICIPANT, HttpStatusCode.FORBIDDEN);
        }

        return await this.dmRepository.findByConversationId(conversationId, limit, skip);
    }
}
