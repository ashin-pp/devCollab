import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import type { IWorkspaceRepository } from "../../../application/interfaces/repositories/workspace.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { AppError } from "../../../domain/errors/AppError";
import { IRemoveWorkspaceMemberUseCase } from "../../interfaces/use-cases/workspace/remove-workspace-member.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class RemoveWorkspaceMemberUseCase implements IRemoveWorkspaceMemberUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository,
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(payload: {workspaceId: string, requesterId: string, targetUserId: string}): Promise<void> {
        const { workspaceId, requesterId, targetUserId } = payload;
        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const requesterMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, requesterId);
        if (!requesterMember) {
            throw new AppError(ErrorMessage.NOT_A_WORKSPACE_MEMBER, HttpStatusCode.FORBIDDEN);
        }

        if (requesterId !== targetUserId) {
            if (requesterMember.role !== MemberRole.OWNER) {
                throw new AppError(ErrorMessage.UNAUTHORIZED_ROLE, HttpStatusCode.FORBIDDEN);
            }
        } else if (requesterMember.role === MemberRole.OWNER) {
            throw new AppError(ErrorMessage.OWNER_CANNOT_LEAVE, HttpStatusCode.BAD_REQUEST);
        }

        const targetMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, targetUserId);
        if (!targetMember) {
            throw new AppError(ErrorMessage.TARGET_NOT_IN_WORKSPACE, HttpStatusCode.NOT_FOUND);
        }

        await this._workspaceMemberRepository.remove(workspaceId, targetUserId);

        // Cascade delete: remove user from all channels in this workspace
        const channels = await this._channelRepository.findByWorkspaceId(workspaceId);
        for (const channel of channels) {
            if (channel.id) {
                await this._channelMemberRepository.remove(channel.id, targetUserId);
            }
        }
    }
}
