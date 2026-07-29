import mongoose, { Schema, Document } from "mongoose";

export interface IDirectMessageDocument extends Document {
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
    isSeen: boolean;
    messageType: 'text' | 'image';
    imageUrl?: string;
    isEdited: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DirectMessageSchema: Schema = new Schema(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { 
            type: String, 
            required: function(this: any) {
                return this.messageType === 'text';
            }
        },
        isSeen: { type: Boolean, default: false },
        messageType: { type: String, enum: ['text', 'image'], default: 'text' },
        imageUrl: { type: String },
        isEdited: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
);

// Index to easily fetch messages for a conversation ordered by time
DirectMessageSchema.index({ conversationId: 1, createdAt: -1 });

export const DirectMessageModel = mongoose.model<IDirectMessageDocument>('DirectMessage', DirectMessageSchema);
