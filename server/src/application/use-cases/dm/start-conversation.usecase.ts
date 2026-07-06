import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IConversationRepository } from "../../../application/interfaces/repositories/conversation.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import { Conversation } from "../../../domain/entities/conversation.entity";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberStatus } from "../../../domain/enums/MemberStatus";

@injectable()
export class StartConversationUseCase {
    constructor(
        @inject(TOKENS.IConversationRepository) private _conversationRepository: IConversationRepository,
        @inject(TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(workspaceId: string, initiatorId: string, receiverId: string): Promise<Conversation> {
        // Allow users to message themselves (Note to Self feature)
        // if (initiatorId === receiverId) {
        //     throw new AppError(ErrorMessage.CANNOT_MESSAGE_YOURSELF, HttpStatusCode.BAD_REQUEST);
        // }

        const initiator = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, initiatorId);
        if (!initiator || initiator.status !== MemberStatus.APPROVED) {
            throw new AppError(ErrorMessage.NOT_APPROVED_MEMBER, HttpStatusCode.FORBIDDEN);
        }

        const receiver = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, receiverId);
        if (!receiver || receiver.status !== MemberStatus.APPROVED) {
            throw new AppError(ErrorMessage.TARGET_NOT_APPROVED_MEMBER, HttpStatusCode.FORBIDDEN);
        }

        const existing = await this._conversationRepository.findByParticipants(workspaceId, initiatorId, receiverId);
        if (existing) {
            return existing;
        }

        return await this._conversationRepository.create(
            new Conversation(workspaceId, initiatorId, receiverId)
        );
    }
}
