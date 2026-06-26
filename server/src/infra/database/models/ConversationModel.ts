import mongoose, { Schema, Document } from 'mongoose';

export interface IConversationDocument extends Document {
    workspaceId: mongoose.Types.ObjectId;
    participant1Id: mongoose.Types.ObjectId;
    participant2Id: mongoose.Types.ObjectId;
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
    {
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
        participant1Id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        participant2Id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        lastMessageAt: { type: Date }
    },
    {
        timestamps: true
    }
);

// Ensure uniqueness of a conversation between two users in a workspace
ConversationSchema.index({ workspaceId: 1, participant1Id: 1, participant2Id: 1 }, { unique: true });

export const ConversationModel = mongoose.model<IConversationDocument>('Conversation', ConversationSchema);
