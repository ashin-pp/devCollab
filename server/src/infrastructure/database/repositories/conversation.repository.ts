import { injectable } from 'tsyringe';
import { Conversation } from "../../../domain/entities/conversation.entity";
import { IConversationRepository } from "../../../application/interfaces/repositories/conversation.repository.interface";
import { ConversationModel } from "../models/conversation.model";

@injectable()
export class ConversationRepository implements IConversationRepository {
    private toEntity(doc: any): Conversation {
        return new Conversation(
            doc.workspaceId.toString(),
            doc.participant1Id.toString(),
            doc.participant2Id.toString(),
            doc.lastMessageAt,
            doc.createdAt,
            doc.updatedAt,
            doc._id.toString()
        );
    }

    async create(conversation: Conversation): Promise<Conversation> {
        // Ensure participant1 is always the smaller ID to avoid duplicates
        const p1 = conversation.participant1Id < conversation.participant2Id ? conversation.participant1Id : conversation.participant2Id;
        const p2 = conversation.participant1Id < conversation.participant2Id ? conversation.participant2Id : conversation.participant1Id;

        const newConversation = new ConversationModel({
            workspaceId: conversation.workspaceId,
            participant1Id: p1,
            participant2Id: p2,
            lastMessageAt: conversation.lastMessageAt
        });

        const saved = await newConversation.save();
        return this.toEntity(saved);
    }

    async findById(id: string): Promise<Conversation | null> {
        const doc = await ConversationModel.findById(id).lean();
        if (!doc) return null;
        return this.toEntity(doc);
    }

    async findByParticipants(workspaceId: string, participant1Id: string, participant2Id: string): Promise<Conversation | null> {
        const p1 = participant1Id < participant2Id ? participant1Id : participant2Id;
        const p2 = participant1Id < participant2Id ? participant2Id : participant1Id;

        const doc = await ConversationModel.findOne({
            workspaceId,
            participant1Id: p1,
            participant2Id: p2
        }).lean();

        if (!doc) return null;
        return this.toEntity(doc);
    }

    async findByUser(workspaceId: string, userId: string): Promise<Conversation[]> {
        const docs = await ConversationModel.find({
            workspaceId,
            $or: [{ participant1Id: userId }, { participant2Id: userId }]
        }).sort({ lastMessageAt: -1 }).lean();

        return docs.map(this.toEntity);
    }

    async updateLastMessageTime(id: string, time: Date): Promise<void> {
        await ConversationModel.findByIdAndUpdate(id, { lastMessageAt: time });
    }
}
