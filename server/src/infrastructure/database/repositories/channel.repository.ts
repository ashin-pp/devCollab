import { injectable } from 'tsyringe';
import { IChannelRepository } from "../../../application/interfaces/repositories/channel.repository.interface";
import { Channel } from "../../../domain/entities/channel.entity";
import { ChannelModel } from "../models/channel.model";
import { ChannelMapper } from "../mappers/channel.mapper";

@injectable()
export class ChannelRepository implements IChannelRepository {
    private _mapper = new ChannelMapper();

    async create(channel: Channel): Promise<Channel> {
        const created = await ChannelModel.create({
            workspace_id: channel.workspaceId,
            name: channel.name,
            description: channel.description,
            created_by: channel.createdBy,
            is_active: channel.isActive,
            privacy: channel.privacy
        });
        return this._mapper.toDomain(created);
    }

    async findById(id: string): Promise<Channel | null> {
        const channel = await ChannelModel.findById(id);
        return channel ? this._mapper.toDomain(channel) : null;
    }

    async findByWorkspaceId(workspaceId: string): Promise<Channel[]> {
        const channels = await ChannelModel.find({ workspace_id: workspaceId });
        return channels.map(c => this._mapper.toDomain(c));
    }

    async update(id: string, channelData: Partial<Channel>): Promise<Channel | null> {
        const updateData: any = {};
        if (channelData.name) updateData.name = channelData.name;
        if (channelData.description !== undefined) updateData.description = channelData.description;
        if (channelData.isActive !== undefined) updateData.is_active = channelData.isActive;
        if (channelData.privacy) updateData.privacy = channelData.privacy;

        const updated = await ChannelModel.findByIdAndUpdate(id, updateData, { new: true });
        return updated ? this._mapper.toDomain(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await ChannelModel.findByIdAndDelete(id);
        return result !== null;
    }
}
