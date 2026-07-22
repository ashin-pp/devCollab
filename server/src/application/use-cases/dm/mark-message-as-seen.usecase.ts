import { inject, injectable } from 'tsyringe';
import type { IConversationRepository } from "../../../application/interfaces/repositories/conversation.repository.interface";
import type { IDirectMessageRepository } from "../../../application/interfaces/repositories/direct-message.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { IMarkMessageAsSeenUseCase } from "../../interfaces/use-cases/dm/mark-message-as-seen.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class MarkMessageAsSeenUseCase implements IMarkMessageAsSeenUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IDirectMessageRepository) private _dmRepository: IDirectMessageRepository,
        @inject(REPOSITORY_TOKENS.IConversationRepository) private _conversationRepository: IConversationRepository
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
