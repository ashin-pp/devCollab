import { IChannelRepository } from "../../../domain/repositories/IChannelRepository";
import { IChannelMemberRepository } from "../../../domain/repositories/IChannelMemberRepository";
import { Channel } from "../../../domain/entities/Channel";
import { ChannelMember } from "../../../domain/entities/ChannelMember";

export class CreateChannelUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(workspaceId: string, name: string, description: string, creatorId: string, privacy: 'public' | 'private'): Promise<Channel> {
        const newChannel = new Channel(
            workspaceId,
            name,
            description,
            creatorId,
            privacy,
            true
        );

        const createdChannel = await this.channelRepository.create(newChannel);

        const member = new ChannelMember(
            createdChannel.id as string,
            creatorId,
            creatorId,
            'admin',
            true
        );
        
        await this.channelMemberRepository.create(member);

        return createdChannel;
    }
}
