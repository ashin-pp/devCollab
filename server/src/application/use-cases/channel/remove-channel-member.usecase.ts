import { inject, injectable } from 'tsyringe';
import type { IChannelMemberRepository } from "../../../application/interfaces/repositories/channel-member.repository.interface";
import type { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IWorkspaceMemberRepository } from "../../../application/interfaces/repositories/workspace-member.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";
import { AppError } from "../../../domain/errors/AppError";
import { IRemoveChannelMemberUseCase } from "../../interfaces/use-cases/channel/remove-channel-member.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class RemoveChannelMemberUseCase implements IRemoveChannelMemberUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository: IChannelRepository,
        @inject(REPOSITORY_TOKENS.IChannelMemberRepository) private _channelMemberRepository: IChannelMemberRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IWorkspaceMemberRepository) private _workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(payload: {workspaceId: string, channelId: string, targetUserId: string, requestUserId: string}): Promise<{ userId: string, userName: string, removedBy: string }> {
        const { workspaceId, channelId, targetUserId, requestUserId } = payload;

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
