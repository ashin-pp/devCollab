import { IChannelMemberRepository } from "../../../domain/repositories/IChannelMemberRepository";
import { IWorkspaceMemberRepository } from "../../../domain/repositories/IWorkspaceMemberRepository";
import { IChannelRepository } from "../../../domain/repositories/IChannelRepository";
import { ChannelMember } from "../../../domain/entities/ChannelMember";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class AddChannelMemberUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository,
        private workspaceMemberRepository: IWorkspaceMemberRepository
    ) {}

    async execute(workspaceId: string, channelId: string, userIds: string[], requestUserId: string) {
        if (!workspaceId || !channelId || !userIds || userIds.length === 0) {
            throw new AppError("Invalid input parameters", HttpStatusCode.BAD_REQUEST);
        }

        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError("Channel not found", HttpStatusCode.NOT_FOUND);
        }

        // Verify request user is a member of the channel
        const requestMember = await this.channelMemberRepository.findByChannelAndUser(channelId, requestUserId);
        
        // If it's a private channel, only creator or admin can add. For now, we allow any member to add to public channels.
        // Actually, let's keep it simple: any channel member can add another workspace member to a channel.
        if (!requestMember && channel.createdBy !== requestUserId) {
            // But wait, if channel is public, anyone in workspace can join. If private, only members can invite.
            if (channel.privacy === 'private') {
                throw new AppError("You don't have permission to add members to this private channel", HttpStatusCode.FORBIDDEN);
            }
            // For public channel, anyone in the workspace can add themselves or others
            const workspaceMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, requestUserId);
            if (!workspaceMember || workspaceMember.status !== 'approved') {
                throw new AppError("You must be an approved workspace member to join channels", HttpStatusCode.FORBIDDEN);
            }
        }

        const addedMembers = [];

        for (const targetUserId of userIds) {
            // Check if user is in workspace
            const workspaceMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, targetUserId);
            if (!workspaceMember || workspaceMember.status !== 'approved') {
                continue; // Skip invalid users
            }

            // Check if already in channel
            const existingMember = await this.channelMemberRepository.findByChannelAndUser(channelId, targetUserId);
            if (existingMember) {
                continue; // Skip existing members
            }

            const newMember = new ChannelMember(
                channelId,
                targetUserId,
                requestUserId,
                'member',
                true,
                'approved',
                new Date()
            );

            const added = await this.channelMemberRepository.create(newMember);
            addedMembers.push(added);
        }

        return addedMembers;
    }
}
