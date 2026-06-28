import { IChannelRepository } from "../../../application/repositories/IChannelRepository";
import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { IWorkspaceRepository } from "../../../application/repositories/IWorkspaceRepository";
import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { ChannelMember } from "../../../domain/entities/ChannelMember";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ChannelMemberRole, ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";

export class JoinChannelUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository,
        private workspaceRepository: IWorkspaceRepository,
        private userRepository: IUserRepository
    ) { }


    async execute(workspaceId: string, channelId: string, userId: string): Promise<{ success: boolean; status: string; message: string; userName?: string }> {
        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const isWorkspaceOwner = workspace.createdBy === userId;

        const existingMember = await this.channelMemberRepository.findByChannelAndUser(channelId, userId);
        if (existingMember) {
            if (existingMember.status === ChannelMemberStatus.BLOCKED) {
                throw new AppError("You have been blocked from joining this channel.", HttpStatusCode.FORBIDDEN);
            } else if (existingMember.status === ChannelMemberStatus.APPROVED) {
                throw new AppError(ErrorMessage.ALREADY_CHANNEL_MEMBER, HttpStatusCode.BAD_REQUEST);
            } else if (existingMember.status === ChannelMemberStatus.PENDING) {
                if (isWorkspaceOwner) {
                    await this.channelMemberRepository.updateStatus(channelId, userId, ChannelMemberStatus.APPROVED);
                    return { success: true, status: ChannelMemberStatus.APPROVED, message: 'Successfully joined the channel' };
                }
                throw new AppError(ErrorMessage.CHANNEL_JOIN_REQUEST_PENDING, HttpStatusCode.BAD_REQUEST);
            } else if (existingMember.status === ChannelMemberStatus.REJECTED) {
                if (isWorkspaceOwner) {
                    await this.channelMemberRepository.updateStatus(channelId, userId, ChannelMemberStatus.APPROVED);
                    return { success: true, status: ChannelMemberStatus.APPROVED, message: 'Successfully joined the channel' };
                }
                await this.channelMemberRepository.updateStatus(channelId, userId, ChannelMemberStatus.PENDING);
                return { success: true, status: ChannelMemberStatus.PENDING, message: 'Join request submitted' };
            }
        }

        let newStatus = channel.privacy === 'public' ? ChannelMemberStatus.APPROVED : ChannelMemberStatus.PENDING;

        // Workspace Owner bypass
        if (isWorkspaceOwner) {
            newStatus = ChannelMemberStatus.APPROVED;
        }
        const member = new ChannelMember(
            channelId,
            userId,
            userId,
            ChannelMemberRole.MEMBER,
            true,
            newStatus
        );

        await this.channelMemberRepository.create(member);

        const user = await this.userRepository.findById(userId);

        return {
            success: true,
            status: newStatus,
            message: newStatus === ChannelMemberStatus.APPROVED ? 'Successfully joined the channel' : 'Join request submitted',
            userName: user?.name || 'A user'
        };
    }
}
