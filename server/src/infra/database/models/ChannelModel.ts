import mongoose, { Document, Schema } from 'mongoose';

export interface IChannelDocument extends Document {
    workspace_id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    created_by: mongoose.Types.ObjectId;
    is_active: boolean;
    privacy: 'public' | 'private';
    created_at: Date;
    updated_at: Date;
}

const channelSchema = new Schema({
    workspace_id: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    name: { type: String, required: true },
    description: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    is_active: { type: Boolean, default: true },
    privacy: { type: String, enum: ['public', 'private'], default: 'public' }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const ChannelModel = mongoose.model<IChannelDocument>('Channel', channelSchema);
