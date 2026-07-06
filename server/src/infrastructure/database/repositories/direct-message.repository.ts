import { injectable } from 'tsyringe';
import { DirectMessage } from "../../../domain/entities/direct-message.entity";
import { IDirectMessageRepository } from "../../../application/interfaces/repositories/direct-message.repository.interface";
import { DirectMessageModel, IDirectMessageDocument } from "../models/direct-message.model";
import { ConversationModel } from "../models/conversation.model";
import { DirectMessageMapper } from "../mappers/direct-message.mapper";

@injectable()
export class DirectMessageRepository implements IDirectMessageRepository {
    private _mapper = new DirectMessageMapper();

    async create(message: DirectMessage): Promise<DirectMessage> {
        const newMessage = new DirectMessageModel({
            conversationId: message.conversationId,
            senderId: message.senderId,
            content: message.content,
            isSeen: message.isSeen,
            messageType: message.messageType,
            imageUrl: message.imageUrl,
            isEdited: message.isEdited
        });

        const saved = await newMessage.save();
        return this._mapper.toDomain(saved);
    }

    async findByConversationId(conversationId: string, limit: number = 50, skip: number = 0): Promise<DirectMessage[]> {
        const docs = await DirectMessageModel.find({ conversationId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Reverse to return in chronological order
        return docs.map(doc => this._mapper.toDomain(doc as unknown as IDirectMessageDocument)).reverse();
    }

    async markAsSeen(conversationId: string, receiverId: string): Promise<void> {
        const conversation = await ConversationModel.findById(conversationId);
        const isNoteToSelf = conversation && conversation.participant1Id.toString() === conversation.participant2Id.toString();

        const query: Record<string, unknown> = { conversationId, isSeen: false };
        if (!isNoteToSelf) {
            query.senderId = { $ne: receiverId };
        }

        await DirectMessageModel.updateMany(
            query,
            { $set: { isSeen: true } }
        );
    }

    async findLastMessageByConversationId(conversationId: string): Promise<DirectMessage | null> {
        const doc = await DirectMessageModel.findOne({ conversationId })
            .sort({ createdAt: -1 })
            .lean();
        return doc ? this._mapper.toDomain(doc as unknown as IDirectMessageDocument) : null;
    }

    async countUnreadMessages(conversationId: string, receiverId: string): Promise<number> {
        const conversation = await ConversationModel.findById(conversationId);
        const isNoteToSelf = conversation && conversation.participant1Id.toString() === conversation.participant2Id.toString();

        const query: Record<string, unknown> = { conversationId, isSeen: false };
        if (!isNoteToSelf) {
            query.senderId = { $ne: receiverId };
        }

        return DirectMessageModel.countDocuments(query);
    }
}
