import { IConversationRepository } from '../../../application/repositories/IConversationRepository';
import { IWorkspaceMemberRepository } from '../../../application/repositories/IWorkspaceMemberRepository';
import { Conversation } from '../../../domain/entities/Conversation';
import { AppError } from '../../../domain/errors/AppError';
import { ErrorMessage } from '../../../domain/enums/ErrorMessage';
import { HttpStatusCode } from '../../../domain/enums/HttpStatusCode';
import { MemberStatus } from '../../../domain/enums/MemberStatus';

export class StartConversationUseCase {
    constructor(
        private conversationRepository: IConversationRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(workspaceId: string, initiatorId: string, receiverId: string): Promise<Conversation> {
        // Allow users to message themselves (Note to Self feature)
        // if (initiatorId === receiverId) {
        //     throw new AppError(ErrorMessage.CANNOT_MESSAGE_YOURSELF, HttpStatusCode.BAD_REQUEST);
        // }

        const initiator = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, initiatorId);
        if (!initiator || initiator.status !== MemberStatus.APPROVED) {
            throw new AppError(ErrorMessage.NOT_APPROVED_MEMBER, HttpStatusCode.FORBIDDEN);
        }

        const receiver = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, receiverId);
        if (!receiver || receiver.status !== MemberStatus.APPROVED) {
            throw new AppError(ErrorMessage.TARGET_NOT_APPROVED_MEMBER, HttpStatusCode.FORBIDDEN);
        }

        const existing = await this.conversationRepository.findByParticipants(workspaceId, initiatorId, receiverId);
        if (existing) {
            return existing;
        }

        return await this.conversationRepository.create(
            new Conversation(workspaceId, initiatorId, receiverId)
        );
    }
}
