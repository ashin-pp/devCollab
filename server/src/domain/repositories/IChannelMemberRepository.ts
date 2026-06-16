import { ChannelMember } from "../entities/ChannelMember";

export interface IChannelMemberRepository {
    create(member: ChannelMember): Promise<ChannelMember>;
    findByChannelId(channelId: string): Promise<ChannelMember[]>;
    findByUserId(userId: string): Promise<ChannelMember[]>;
    findByChannelAndUser(channelId: string, userId: string): Promise<ChannelMember | null>;
    remove(channelId: string, userId: string): Promise<boolean>;
}
