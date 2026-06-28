import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { IWorkspaceMemberRepository } from "../../../application/repositories/IWorkspaceMemberRepository";
import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { IChannelRepository } from "../../../application/repositories/IChannelRepository";
import { ChannelMember } from "../../../domain/entities/ChannelMember";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { MemberStatus } from "../../../domain/enums/MemberStatus";
import { ChannelMemberRole, ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";
import { UserRepository } from "../../../infra/database/repositories/UserRepository";

export class AddChannelMemberUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(workspaceId: string, channelId: string, userIds: string[], requestUserId: string) {
        if (!workspaceId || !channelId || !userIds || userIds.length === 0) {
            throw new AppError(ErrorMessage.INVALID_INPUT_PARAMS, HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const requestMember = await this.channelMemberRepository.findByChannelAndUser(channelId, requestUserId);

        if (!requestMember && channel.createdBy !== requestUserId) {
            if (channel.privacy === 'private') {
                throw new AppError(ErrorMessage.CANNOT_ADD_TO_PRIVATE_CHANNEL, HttpStatusCode.FORBIDDEN);
            }
            const workspaceMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, requestUserId);
            if (!workspaceMember || workspaceMember.status !== MemberStatus.APPROVED) {
                throw new AppError(ErrorMessage.NOT_APPROVED_TO_JOIN_CHANNEL, HttpStatusCode.FORBIDDEN);
            }
        }

        const addedMembers = [];

        for (const targetUserId of userIds) {
            const workspaceMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, targetUserId);
            if (!workspaceMember || workspaceMember.status !== MemberStatus.APPROVED) {
                continue;
            }

            const existingMember = await this.channelMemberRepository.findByChannelAndUser(channelId, targetUserId);
            if (existingMember) {
                continue;
            }

            const newMember = new ChannelMember(
                channelId,
                targetUserId,
                requestUserId,
                ChannelMemberRole.MEMBER,
                true,
                ChannelMemberStatus.APPROVED,
                new Date()
            );

            const added = await this.channelMemberRepository.create(newMember);
            const user = await this.userRepository.findById(targetUserId);

            addedMembers.push({
                member: newMember,
                userName: user?.name || 'A user'
            });
        }

        return addedMembers;
    }
}
