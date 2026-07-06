import mongoose, { Document, Schema } from "mongoose";

export interface IMessageDocument extends Document {
    workspace_id: mongoose.Types.ObjectId;
    channel_id: mongoose.Types.ObjectId;
    sender_id: mongoose.Types.ObjectId;
    content: string;
    message_type: 'text' | 'image' | 'system';
    image_url?: string;
    parent_message_id?: mongoose.Types.ObjectId;
    thread_root_id?: mongoose.Types.ObjectId;
    is_edited: boolean;
    is_pinned: boolean;
    seen_by: mongoose.Types.ObjectId[];
    expires_at?: Date;
    created_at: Date;
    updated_at: Date;
}

const messageSchema = new Schema({
    workspace_id: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    channel_id: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
    sender_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { 
        type: String, 
        required: function(this: any) {
            return this.message_type === 'text' || this.message_type === 'system';
        }
    },
    message_type: { type: String, enum: ['text', 'image', 'system'], default: 'text' },
    image_url: { type: String },
    parent_message_id: { type: Schema.Types.ObjectId, ref: 'Message' },
    thread_root_id: { type: Schema.Types.ObjectId, ref: 'Message' },
    is_edited: { type: Boolean, default: false },
    is_pinned: { type: Boolean, default: false },
    seen_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    expires_at: { type: Date }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const MessageModel = mongoose.model<IMessageDocument>('Message', messageSchema);
