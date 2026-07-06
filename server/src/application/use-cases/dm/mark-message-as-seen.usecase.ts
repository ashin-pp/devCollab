import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IDirectMessageRepository } from "../../../application/interfaces/repositories/direct-message.repository.interface";
import type { IConversationRepository } from "../../../application/interfaces/repositories/conversation.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

@injectable()
export class MarkMessageAsSeenUseCase {
    constructor(
        @inject(TOKENS.IDirectMessageRepository) private _dmRepository: IDirectMessageRepository,
        @inject(TOKENS.IConversationRepository) private _conversationRepository: IConversationRepository
    ) { }

    async execute(conversationId: string, receiverId: string): Promise<void> {
        const conversation = await this._conversationRepository.findById(conversationId);
        if (!conversation) {
            throw new AppError(ErrorMessage.CONVERSATION_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }


        if (conversation.participant1Id !== receiverId && conversation.participant2Id !== receiverId) {
            throw new AppError(ErrorMessage.NOT_CONVERSATION_PARTICIPANT, HttpStatusCode.FORBIDDEN);
        }

        await this._dmRepository.markAsSeen(conversationId, receiverId);
    }
}
