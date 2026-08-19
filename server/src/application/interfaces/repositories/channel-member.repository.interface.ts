import { ChannelMember } from "../../../domain/entities/channel-member.entity";

export interface IChannelMemberRepository {
    create(member: ChannelMember): Promise<ChannelMember>;
    findByChannelId(channelId: string, status?: string): Promise<ChannelMember[]>;
    findByUserId(userId: string): Promise<ChannelMember[]>;
    findByChannelAndUser(channelId: string, userId: string): Promise<ChannelMember | null>;
    findByChannelIdAndUserId(channelId: string, userId: string): Promise<ChannelMember | null>;
    findInactiveByChannelAndUser(channelId: string, userId: string): Promise<ChannelMember | null>;
    reactivate(channelId: string, userId: string, status: string): Promise<ChannelMember | null>;
    remove(channelId: string, userId: string): Promise<boolean>;
    updateStatus(channelId: string, userId: string, status: string): Promise<boolean>;
    updateLastReadAt(channelId: string, userId: string, timestamp: Date): Promise<boolean>;
}
