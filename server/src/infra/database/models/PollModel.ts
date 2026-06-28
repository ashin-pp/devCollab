import mongoose, { Document, Schema } from 'mongoose';

export interface IPollOption {
    _id: mongoose.Types.ObjectId;
    text: string;
    votes: mongoose.Types.ObjectId[];
}

export interface IPollDocument extends Document {
    workspace_id: mongoose.Types.ObjectId;
    channel_id?: mongoose.Types.ObjectId;
    question: string;
    options: IPollOption[];
    created_by: mongoose.Types.ObjectId;
    is_active: boolean;
    expires_at?: Date;
    starts_at?: Date;
    created_at: Date;
    updated_at: Date;
}

const pollOptionSchema = new Schema({
    text: { type: String, required: true },
    votes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const pollSchema = new Schema({
    workspace_id: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    channel_id: { type: Schema.Types.ObjectId, ref: 'Channel' }, // Optional for channel-specific polls
    question: { type: String, required: true },
    options: [pollOptionSchema],
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    is_active: { type: Boolean, default: true },
    expires_at: { type: Date },
    starts_at: { type: Date }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const PollModel = mongoose.model<IPollDocument>('Poll', pollSchema);
