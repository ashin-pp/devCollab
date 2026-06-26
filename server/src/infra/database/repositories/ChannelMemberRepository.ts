import { IChannelMemberRepository } from "../../../application/repositories/IChannelMemberRepository";
import { ChannelMember } from "../../../domain/entities/ChannelMember";
import { ChannelMemberModel } from "../models/ChannelMemberModel";
import { ChannelMemberMapper } from "../../mappers/ChannelMemberMapper";

export class ChannelMemberRepository implements IChannelMemberRepository {
    private _mapper = new ChannelMemberMapper();

    async create(member: ChannelMember): Promise<ChannelMember> {
        const created = await ChannelMemberModel.create({
            channel_id: member.channelId,
            user_id: member.userId,
            added_by: member.addedBy,
            role: member.role,
            is_active: member.isActive,
            status: member.status
        });
        return this._mapper.toDomain(created);
    }

    async findByChannelId(channelId: string, status?: string): Promise<ChannelMember[]> {
        const query: any = { channel_id: channelId, is_active: true };
        if (status) {
            query.status = status;
        } else {
            query.$or = [{ status: 'approved' }, { status: { $exists: false } }];
        }
        const members = await ChannelMemberModel.find(query);
        return members.map(m => this._mapper.toDomain(m));
    }

    async findByUserId(userId: string): Promise<ChannelMember[]> {
        const members = await ChannelMemberModel.find({ user_id: userId, is_active: true });
        return members.map(m => this._mapper.toDomain(m));
    }

    async findByChannelAndUser(channelId: string, userId: string): Promise<ChannelMember | null> {
        const member = await ChannelMemberModel.findOne({ channel_id: channelId, user_id: userId, is_active: true });
        return member ? this._mapper.toDomain(member) : null;
    }

    async findByChannelIdAndUserId(channelId: string, userId: string): Promise<ChannelMember | null> {
        const member = await ChannelMemberModel.findOne({ channel_id: channelId, user_id: userId, is_active: true });
        return member ? this._mapper.toDomain(member) : null;
    }

    async remove(channelId: string, userId: string): Promise<boolean> {
        const result = await ChannelMemberModel.findOneAndUpdate(
            { channel_id: channelId, user_id: userId, is_active: true },
            { is_active: false, removed_at: new Date() }
        );
        return result !== null;
    }

    async updateStatus(channelId: string, userId: string, status: string): Promise<boolean> {
        const result = await ChannelMemberModel.findOneAndUpdate(
            { channel_id: channelId, user_id: userId, is_active: true },
            { status }
        );
        return result !== null;
    }

    async updateLastReadAt(channelId: string, userId: string, timestamp: Date): Promise<boolean> {
        const result = await ChannelMemberModel.findOneAndUpdate(
            { channel_id: channelId, user_id: userId, is_active: true },
            { last_read_at: timestamp }
        );
        return result !== null;
    }
}
