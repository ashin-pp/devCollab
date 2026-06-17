import { IChannelRepository } from "../../../domain/repositories/IChannelRepository";
import { IChannelMemberRepository } from "../../../domain/repositories/IChannelMemberRepository";
import { IMessageRepository } from "../../../domain/repositories/IMessageRepository";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class GetUnreadCountsUseCase {
    constructor(
        private channelRepository: IChannelRepository,
        private channelMemberRepository: IChannelMemberRepository,
        private messageRepository: IMessageRepository
    ) {}

    async execute(workspaceId: string, userId: string) {
        // Get all channels in workspace where user is a member
        const allChannels = await this.channelRepository.findByWorkspaceId(workspaceId);
        const userChannels = [];

        for (const channel of allChannels) {
            const membership = await this.channelMemberRepository.findByChannelIdAndUserId(channel.id!, userId);
            if (membership && membership.status === 'approved') {
                userChannels.push({ channel, membership });
            }
        }

        // Get unread count for each channel
        const unreadCounts: Record<string, number> = {};

        for (const { channel, membership } of userChannels) {
            const lastReadAt = membership.lastReadAt || membership.joinedAt || new Date(0);
            const count = await this.messageRepository.countUnreadMessages(channel.id!, lastReadAt);
            unreadCounts[channel.id!] = count;
        }

        return {
            success: true,
            data: unreadCounts,
            statusCode: HttpStatusCode.OK
        };
    }
}
