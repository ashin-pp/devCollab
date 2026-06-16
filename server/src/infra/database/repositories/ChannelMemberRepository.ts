import { IChannelMemberRepository } from "../../../domain/repositories/IChannelMemberRepository";
import { ChannelMember } from "../../../domain/entities/ChannelMember";
import { ChannelMemberModel } from "../models/ChannelMemberModel";
import { ChannelMemberMapper } from "../../mappers/ChannelMemberMapper";

export class ChannelMemberRepository implements IChannelMemberRepository {
    private mapper = new ChannelMemberMapper();

    async create(member: ChannelMember): Promise<ChannelMember> {
        const created = await ChannelMemberModel.create({
            channel_id: member.channelId,
            user_id: member.userId,
            added_by: member.addedBy,
            role: member.role,
            is_active: member.isActive
        });
        return this.mapper.toDomain(created);
    }

    async findByChannelId(channelId: string): Promise<ChannelMember[]> {
        const members = await ChannelMemberModel.find({ channel_id: channelId, is_active: true });
        return members.map(m => this.mapper.toDomain(m));
    }

    async findByUserId(userId: string): Promise<ChannelMember[]> {
        const members = await ChannelMemberModel.find({ user_id: userId, is_active: true });
        return members.map(m => this.mapper.toDomain(m));
    }

    async findByChannelAndUser(channelId: string, userId: string): Promise<ChannelMember | null> {
        const member = await ChannelMemberModel.findOne({ channel_id: channelId, user_id: userId, is_active: true });
        return member ? this.mapper.toDomain(member) : null;
    }

    async remove(channelId: string, userId: string): Promise<boolean> {
        const result = await ChannelMemberModel.findOneAndUpdate(
            { channel_id: channelId, user_id: userId, is_active: true },
            { is_active: false, removed_at: new Date() }
        );
        return result !== null;
    }
}
