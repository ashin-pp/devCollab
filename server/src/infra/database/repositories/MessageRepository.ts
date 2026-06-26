import { IMessageRepository } from "../../../application/repositories/IMessageRepository";
import { Message } from "../../../domain/entities/Message";
import { MessageModel } from "../models/MessageModel";
import { MessageMapper } from "../../mappers/MessageMapper";

export class MessageRepository implements IMessageRepository {
    private _mapper = new MessageMapper();

    async create(message: Message): Promise<Message> {
        const created = await MessageModel.create({
            workspace_id: message.workspaceId,
            channel_id: message.channelId,
            sender_id: message.senderId,
            content: message.content,
            message_type: message.messageType,
            image_url: message.imageUrl,
            parent_message_id: message.parentMessageId,
            thread_root_id: message.threadRootId
        });
        const populated = await created.populate('sender_id', 'name');
        return this._mapper.toDomain(populated);
    }

    async findById(id: string): Promise<Message | null> {
        const message = await MessageModel.findById(id).populate('sender_id', 'name');
        return message ? this._mapper.toDomain(message) : null;
    }

    async findByChannelId(channelId: string, limit: number, skip: number): Promise<Message[]> {
        const messages = await MessageModel.find({ channel_id: channelId })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender_id', 'name');
        return messages.map(m => this._mapper.toDomain(m));
    }

    async update(id: string, messageData: Partial<Message>): Promise<Message | null> {
        const updateData: any = {};
        if (messageData.content) updateData.content = messageData.content;
        if (messageData.isEdited !== undefined) updateData.is_edited = messageData.isEdited;
        if (messageData.isPinned !== undefined) updateData.is_pinned = messageData.isPinned;
        
        const updated = await MessageModel.findByIdAndUpdate(id, updateData, { new: true });
        return updated ? this._mapper.toDomain(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await MessageModel.findByIdAndDelete(id);
        return result !== null;
    }

    async countUnreadMessages(channelId: string, lastReadAt: Date): Promise<number> {
        const count = await MessageModel.countDocuments({
            channel_id: channelId,
            created_at: { $gt: lastReadAt }
        });
        return count;
    }
}
