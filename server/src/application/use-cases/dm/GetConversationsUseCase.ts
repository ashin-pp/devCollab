import { IConversationRepository } from '../../../application/repositories/IConversationRepository';
import { IUserRepository } from '../../../application/repositories/IUserRepository';
import { AppError } from '../../../domain/errors/AppError';
import { ErrorMessage } from '../../../domain/enums/ErrorMessage';
import { HttpStatusCode } from '../../../domain/enums/HttpStatusCode';
import { ConversationDTO } from '../../dtos/dm/ConversationDTO';

export class GetConversationsUseCase {
    constructor(
        private conversationRepository: IConversationRepository,
        private userRepository: IUserRepository
    ) {}

    async execute(workspaceId: string, userId: string): Promise<ConversationDTO[]> {
        const conversations = await this.conversationRepository.findByUser(workspaceId, userId);

        const enriched: ConversationDTO[] = await Promise.all(
            conversations.map(async (conv) => {
                const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
                const otherUser = await this.userRepository.findById(otherUserId);

                if (!otherUser || !otherUser.id) {
                    throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
                }

                return {
                    id: conv.id as string,
                    workspaceId: conv.workspaceId,
                    lastMessageAt: conv.lastMessageAt,
                    createdAt: conv.createdAt,
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
