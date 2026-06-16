import { IChannelRepository } from "../../../domain/repositories/IChannelRepository";
import { IChannelMemberRepository } from "../../../domain/repositories/IChannelMemberRepository";
import { Channel } from "../../../domain/entities/Channel";

export class GetWorkspaceChannelsUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(workspaceId: string, userId: string): Promise<Channel[]> {
        const allChannels = await this.channelRepository.findByWorkspaceId(workspaceId);
        const userMemberships = await this.channelMemberRepository.findByUserId(userId);
        
        const userChannelIds = userMemberships.map(m => m.channelId);

        return allChannels.filter(channel => 
            channel.privacy === 'public' || userChannelIds.includes(channel.id as string)
        );
    }
}
