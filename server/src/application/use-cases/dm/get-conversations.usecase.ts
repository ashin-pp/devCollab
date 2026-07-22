import { inject, injectable } from 'tsyringe';
import type { IConversationRepository } from "../../../application/interfaces/repositories/conversation.repository.interface";
import type { IDirectMessageRepository } from "../../../application/interfaces/repositories/direct-message.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { ConversationResponseDto } from "../../dtos/dm/response/conversation.response.dto";
import { IGetConversationsUseCase } from "../../interfaces/use-cases/dm/get-conversations.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetConversationsUseCase implements IGetConversationsUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IConversationRepository) private _conversationRepository: IConversationRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IDirectMessageRepository) private _dmRepository: IDirectMessageRepository
    ) {}

    async execute(workspaceId: string, userId: string): Promise<ConversationResponseDto[]> {
        const conversations = await this._conversationRepository.findByUser(workspaceId, userId);

        const enriched: ConversationResponseDto[] = await Promise.all(
            conversations.map(async (conv) => {
                const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
                const otherUser = await this._userRepository.findById(otherUserId);

                if (!otherUser || !otherUser.id) {
                    throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
                }

                const lastMessage = await this._dmRepository.findLastMessageByConversationId(conv.id as string);
                const unreadCount = await this._dmRepository.countUnreadMessages(conv.id as string, userId);

                return {
                    id: conv.id as string,
                    workspaceId: conv.workspaceId,
                    lastMessageAt: conv.lastMessageAt,
                    lastMessage: lastMessage ? lastMessage.content : undefined,
                    unreadCount,
                    createdAt: conv.createdAt as Date,
                    otherUser: {
                        id: otherUser.id,
                        name: otherUser.name,
                        profileImage: otherUser.profileImage,
                    },
                };
            })
        );

        return enriched;
    }
}
