import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class RemoveChannelMemberUseCase implements IBaseUseCase<{workspaceId: string, channelId: string, targetUserId: string, requestUserId: string}, { userId: string, userName: string, removedBy: string }> {
    constructor(
        @inject(TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(payload: {workspaceId: string, channelId: string, targetUserId: string, requestUserId: string}): Promise<{ userId: string, userName: string, removedBy: string }> {
        const { workspaceId, channelId, targetUserId, requestUserId } = payload;
        if (!workspaceId || !channelId || !targetUserId) {
            throw new AppError(ErrorMessage.INVALID_PARAMS, HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this._channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (channel.createdBy !== requestUserId) {
            const workspaceMember = await this._workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, requestUserId);
            const isWorkspaceOwner = workspaceMember?.role === MemberRole.OWNER;
            if (!isWorkspaceOwner) {
                throw new AppError(ErrorMessage.CHANNEL_CREATOR_ONLY, HttpStatusCode.FORBIDDEN);
            }
        }

        if (targetUserId === channel.createdBy) {
            throw new AppError(ErrorMessage.CHANNEL_CREATOR_CANNOT_BE_REMOVED, HttpStatusCode.BAD_REQUEST);
        }

        const success = await this._channelMemberRepository.remove(channelId, targetUserId);
        if (!success) {
            throw new AppError(ErrorMessage.CHANNEL_MEMBER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const [targetUser, requestUser] = await Promise.all([
            this._userRepository.findById(targetUserId),
            this._userRepository.findById(requestUserId)
        ]);

        return {
            userId: targetUserId,
            userName: targetUser?.name || 'Unknown User',
            removedBy: requestUser?.name || 'Admin'
        };
    }
}
