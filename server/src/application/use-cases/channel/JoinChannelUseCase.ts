import { IChannelRepository } from "../../../application/repositories/IChannelRepository";
import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { ChannelMember } from "../../../domain/entities/ChannelMember";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ChannelMemberRole, ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";

export class JoinChannelUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(workspaceId: string, channelId: string, userId: string): Promise<{ success: boolean; status: string; message: string }> {
        const channel = await this.channelRepository.findById(channelId);
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new AppError(ErrorMessage.CHANNEL_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const existingMember = await this.channelMemberRepository.findByChannelAndUser(channelId, userId);
        if (existingMember) {
            if (existingMember.status === ChannelMemberStatus.APPROVED) {
                throw new AppError(ErrorMessage.ALREADY_CHANNEL_MEMBER, HttpStatusCode.BAD_REQUEST);
            } else if (existingMember.status === ChannelMemberStatus.PENDING) {
                throw new AppError(ErrorMessage.CHANNEL_JOIN_REQUEST_PENDING, HttpStatusCode.BAD_REQUEST);
            } else if (existingMember.status === ChannelMemberStatus.REJECTED) {
                await this.channelMemberRepository.updateStatus(channelId, userId, ChannelMemberStatus.PENDING);
                return { success: true, status: ChannelMemberStatus.PENDING, message: 'Join request submitted' };
            }
        }

        const newStatus = channel.privacy === 'public' ? ChannelMemberStatus.APPROVED : ChannelMemberStatus.PENDING;
        const member = new ChannelMember(
            channelId,
            userId,
            userId,
            ChannelMemberRole.MEMBER,
            true,
            newStatus
        );

        await this.channelMemberRepository.create(member);

        return {
            success: true,
            status: newStatus,
            message: newStatus === ChannelMemberStatus.APPROVED ? 'Successfully joined the channel' : 'Join request submitted'
        };
    }
}
