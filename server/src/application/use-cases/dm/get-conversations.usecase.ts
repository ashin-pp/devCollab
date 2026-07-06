import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IConversationRepository } from "../../../application/interfaces/repositories/conversation.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IDirectMessageRepository } from "../../../application/interfaces/repositories/direct-message.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ConversationResponseDto } from "../../dtos/dm/response/conversation.response.dto";

@injectable()
export class GetConversationsUseCase {
    constructor(
        @inject(TOKENS.IConversationRepository) private _conversationRepository: IConversationRepository,
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.IDirectMessageRepository) private _dmRepository: IDirectMessageRepository
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
