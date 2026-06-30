import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { IChannelRepository } from "../../../application/repositories/IChannelRepository";
import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { IWorkspaceMemberRepository } from "../../../application/repositories/IWorkspaceMemberRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberRole } from "../../../domain/enums/MemberRole";

export class RemoveChannelMemberUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository,
        private userRepository: IUserRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(workspaceId: string, channelId: string, targetUserId: string, requestUserId: string) {
        if (!workspaceId || !channelId || !targetUserId) {
            throw new AppError(ErrorMessage.INVALID_PARAMS, HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (channel.createdBy !== requestUserId) {
            const workspaceMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, requestUserId);
            const isWorkspaceOwner = workspaceMember?.role === MemberRole.OWNER;
            if (!isWorkspaceOwner) {
                throw new AppError(ErrorMessage.CHANNEL_CREATOR_ONLY, HttpStatusCode.FORBIDDEN);
            }
        }

        if (targetUserId === channel.createdBy) {
            throw new AppError(ErrorMessage.CHANNEL_CREATOR_CANNOT_BE_REMOVED, HttpStatusCode.BAD_REQUEST);
        }

        const success = await this.channelMemberRepository.remove(channelId, targetUserId);
        if (!success) {
            throw new AppError(ErrorMessage.CHANNEL_MEMBER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const [targetUser, requestUser] = await Promise.all([
            this.userRepository.findById(targetUserId),
            this.userRepository.findById(requestUserId)
        ]);

        return {
            userId: targetUserId,
            userName: targetUser?.name || 'Unknown User',
            removedBy: requestUser?.name || 'Admin'
        };
    }
}
