import { inject, injectable } from 'tsyringe';
import type { IConversationRepository } from "../../../application/interfaces/repositories/conversation.repository.interface";
import type { IDirectMessageRepository } from "../../../application/interfaces/repositories/direct-message.repository.interface";
import { DirectMessage } from "../../../domain/entities/direct-message.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { IGetDirectMessagesUseCase } from "../../interfaces/use-cases/dm/get-direct-messages.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetDirectMessagesUseCase implements IGetDirectMessagesUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IDirectMessageRepository) private _dmRepository: IDirectMessageRepository,
        @inject(REPOSITORY_TOKENS.IConversationRepository) private _conversationRepository: IConversationRepository
    ) {}

    async execute(conversationId: string, userId: string, limit: number = 50, skip: number = 0): Promise<DirectMessage[]> {
        const conversation = await this._conversationRepository.findById(conversationId);
        if (!conversation) {
            throw new AppError(ErrorMessage.CONVERSATION_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
            throw new AppError(ErrorMessage.NOT_CONVERSATION_PARTICIPANT, HttpStatusCode.FORBIDDEN);
        }

        return await this._dmRepository.findByConversationId(conversationId, limit, skip);
    }
}
