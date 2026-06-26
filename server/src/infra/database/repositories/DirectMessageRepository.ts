import { DirectMessage } from '../../../domain/entities/DirectMessage';
import { IDirectMessageRepository } from '../../../application/repositories/IDirectMessageRepository';
import { DirectMessageModel } from '../models/DirectMessageModel';

export class DirectMessageRepository implements IDirectMessageRepository {
    private toEntity(doc: any): DirectMessage {
        return new DirectMessage(
            doc.conversationId.toString(),
            doc.senderId.toString(),
            doc.content,
            doc.isSeen,
            doc.messageType,
            doc.imageUrl,
            doc.isEdited,
            doc.createdAt,
            doc.updatedAt,
            doc._id.toString()
        );
    }

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
        return this.toEntity(saved);
    }

    async findByConversationId(conversationId: string, limit: number = 50, skip: number = 0): Promise<DirectMessage[]> {
        const docs = await DirectMessageModel.find({ conversationId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Reverse to return in chronological order
        return docs.map(this.toEntity).reverse();
    }

    async markAsSeen(conversationId: string, receiverId: string): Promise<void> {
        await DirectMessageModel.updateMany(
            { conversationId, senderId: { $ne: receiverId }, isSeen: false },
            { $set: { isSeen: true } }
        );
    }

    async findLastMessageByConversationId(conversationId: string): Promise<DirectMessage | null> {
        const doc = await DirectMessageModel.findOne({ conversationId })
            .sort({ createdAt: -1 })
            .lean();
        return doc ? this.toEntity(doc) : null;
    }

    async countUnreadMessages(conversationId: string, receiverId: string): Promise<number> {
        return DirectMessageModel.countDocuments({
            conversationId,
            senderId: { $ne: receiverId },
            isSeen: false
        });
    }
}
