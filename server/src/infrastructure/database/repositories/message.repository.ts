import { injectable } from 'tsyringe';
import { IMessageRepository } from "../../../application/interfaces/repositories/message.repository.interface";
import { Message } from "../../../domain/entities/message.entity";
import { MessageModel } from "../models/message.model";
import { MessageMapper } from "../mappers/message.mapper";
import mongoose from 'mongoose';

@injectable()
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
            thread_root_id: message.threadRootId,
            reply_visibility: message.replyVisibility,
            visible_to_user_id: message.visibleToUserId
        });
        const populated = await created.populate('sender_id', 'name');
        return this._mapper.toDomain(populated);
    }

    async findById(id: string): Promise<Message | null> {
        const message = await MessageModel.findById(id).populate('sender_id', 'name');
        return message ? this._mapper.toDomain(message) : null;
    }

    async findByChannelId(channelId: string, limit: number, skip: number): Promise<Message[]> {
        const messages = await MessageModel.find({
            channel_id: channelId,
            $or: [
                { thread_root_id: { $exists: false } },
                { thread_root_id: null }
            ]
        })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender_id', 'name');
        return messages.map(m => this._mapper.toDomain(m));
    }

    async findThreadReplies(threadRootId: string, viewerId: string): Promise<Message[]> {
        const messages = await MessageModel.find({
            thread_root_id: threadRootId,
            $or: [
                { reply_visibility: { $ne: 'author' } },
                { reply_visibility: 'author', sender_id: viewerId },
                { reply_visibility: 'author', visible_to_user_id: viewerId }
            ]
        })
            .sort({ created_at: 1 })
            .populate('sender_id', 'name');
        return messages.map(m => this._mapper.toDomain(m));
    }

    async countVisibleRepliesByRootIds(rootIds: string[], viewerId: string): Promise<Record<string, number>> {
        if (rootIds.length === 0) return {};

        const objectIds = rootIds.map(id => new mongoose.Types.ObjectId(id));
        const viewerObjectId = new mongoose.Types.ObjectId(viewerId);

        const results = await MessageModel.aggregate([
            {
                $match: {
                    thread_root_id: { $in: objectIds },
                    $or: [
                        { reply_visibility: { $ne: 'author' } },
                        { reply_visibility: 'author', sender_id: viewerObjectId },
                        { reply_visibility: 'author', visible_to_user_id: viewerObjectId }
                    ]
                }
            },
            {
                $group: {
                    _id: '$thread_root_id',
                    count: { $sum: 1 }
                }
            }
        ]);

        const counts: Record<string, number> = {};
        for (const row of results) {
            counts[row._id.toString()] = row.count;
        }
        return counts;
    }

    async update(id: string, messageData: Partial<Message>): Promise<Message | null> {
        const updateData: Record<string, unknown> = {};
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
            created_at: { $gt: lastReadAt },
            $or: [
                { thread_root_id: { $exists: false } },
                { thread_root_id: null }
            ]
        });
        return count;
    }

    async findUnreadMessages(channelId: string, lastReadAt: Date): Promise<Message[]> {
        const messages = await MessageModel.find({
            channel_id: channelId,
            created_at: { $gt: lastReadAt },
            $or: [
                { thread_root_id: { $exists: false } },
                { thread_root_id: null }
            ]
        }).populate('sender_id', 'name').sort({ created_at: 1 });
        return messages.map(m => this._mapper.toDomain(m));
    }
}
