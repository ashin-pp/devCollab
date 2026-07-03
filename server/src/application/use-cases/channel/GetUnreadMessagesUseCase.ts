import { IMessageRepository } from "../../../application/repositories/IMessageRepository";
import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { Message } from "../../../domain/entities/Message";

export class GetUnreadMessagesUseCase {
    constructor(
        private messageRepository: IMessageRepository,
        private channelMemberRepository: IChannelMemberRepository
    ) {}

    async execute(channelId: string, userId: string): Promise<Message[]> {
        const member = await this.channelMemberRepository.findByChannelAndUser(channelId, userId);
        
        if (!member) {
            throw new Error("User is not a member of this channel");
        }

        // If lastReadAt is not set, they've never read anything. 
        // We'll fallback to fetching the last 50 messages (or all, but we don't want to fetch millions)
        // Let's use joinedAt as a fallback date if lastReadAt is undefined
        const dateToCompare = member.lastReadAt || member.joinedAt || new Date(0);

        return await this.messageRepository.findUnreadMessages(channelId, dateToCompare);
    }
}
