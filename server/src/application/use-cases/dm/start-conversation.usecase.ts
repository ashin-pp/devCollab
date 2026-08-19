import { inject, injectable } from 'tsyringe';
import type { IConversationRepository } from "../../../application/interfaces/repositories/conversation.repository.interface";
import type { IDirectMessageRepository } from "../../../application/interfaces/repositories/direct-message.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import { Conversation } from "../../../domain/entities/conversation.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberStatus } from "../../../domain/enums/MemberStatus";
import { AppError } from "../../../domain/errors/AppError";
import { ConversationResponseDto } from "../../dtos/dm/response/conversation.response.dto";
import { IStartConversationUseCase } from "../../interfaces/use-cases/dm/start-conversation.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class StartConversationUseCase implements IStartConversationUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IConversationRepository) private _conversationRepository: IConversationRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IDirectMessageRepository) private _dmRepository: IDirectMessageRepository
    ) {}

    async execute(
        workspaceId: string,
        initiatorId: string,
        receiverId: string
    ): Promise<ConversationResponseDto> {
        const initiator = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, initiatorId);
        if (!initiator || initiator.status !== MemberStatus.APPROVED) {
            throw new AppError(ErrorMessage.NOT_APPROVED_MEMBER, HttpStatusCode.FORBIDDEN);
        }

        const receiver = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, receiverId);
        if (!receiver || receiver.status !== MemberStatus.APPROVED) {
            throw new AppError(ErrorMessage.TARGET_NOT_APPROVED_MEMBER, HttpStatusCode.FORBIDDEN);
        }

        const existing = await this._conversationRepository.findByParticipants(workspaceId, initiatorId, receiverId);
        const conversation = existing ?? await this._conversationRepository.create(
            new Conversation(workspaceId, initiatorId, receiverId)
        );

        // Note-to-self: otherUser is the same user
        const otherUserId = conversation.participant1Id === initiatorId
            ? conversation.participant2Id
            : conversation.participant1Id;
        const otherUser = await this._userRepository.findById(otherUserId);

        if (!otherUser || !otherUser.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const lastMessage = await this._dmRepository.findLastMessageByConversationId(conversation.id as string);
        const unreadCount = await this._dmRepository.countUnreadMessages(conversation.id as string, initiatorId);

        return {
            id: conversation.id as string,
            workspaceId: conversation.workspaceId,
            lastMessageAt: lastMessage?.createdAt || conversation.lastMessageAt,
            lastMessage: lastMessage ? lastMessage.content : undefined,
            unreadCount,
            createdAt: conversation.createdAt as Date,
            otherUser: {
                id: otherUser.id,
                name: otherUser.name,
                profileImage: otherUser.profileImage,
            },
        };
    }
}
