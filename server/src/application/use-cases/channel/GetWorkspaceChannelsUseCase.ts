import { IChannelRepository } from "../../../application/repositories/IChannelRepository";
import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { Channel } from "../../../domain/entities/Channel";
import { ChannelMemberStatus } from "../../../domain/enums/ChannelMemberStatus";

export class GetWorkspaceChannelsUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(workspaceId: string, userId: string): Promise<Channel[]> {
        const allChannels = await this.channelRepository.findByWorkspaceId(workspaceId);
        const userMemberships = await this.channelMemberRepository.findByUserId(userId);
        
        const approvedChannelIds = userMemberships.filter(m => m.status === ChannelMemberStatus.APPROVED).map(m => m.channelId);
        const pendingChannelIds = userMemberships.filter(m => m.status === ChannelMemberStatus.PENDING).map(m => m.channelId);

        // Visible channels: All channels are visible in this new design.
        const visibleChannels = allChannels;

        visibleChannels.forEach(channel => {
            channel.isMember = approvedChannelIds.includes(channel.id as string);
            channel.hasPendingRequest = pendingChannelIds.includes(channel.id as string);
        });

        return visibleChannels;
    }
}
