import mongoose, { Document, Schema } from 'mongoose';

export interface IChannelMemberDocument extends Document {
    channel_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    added_by: mongoose.Types.ObjectId;
    role: 'admin' | 'member';
    is_active: boolean;
    status: 'pending' | 'approved' | 'rejected' | 'blocked';
    joined_at: Date;
    removed_at?: Date;
    last_read_at?: Date;
}

const channelMemberSchema = new Schema({
    channel_id: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    added_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    is_active: { type: Boolean, default: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'blocked'], default: 'approved' },
    joined_at: { type: Date, default: Date.now },
    removed_at: { type: Date },
    last_read_at: { type: Date }
});

export const ChannelMemberModel = mongoose.model<IChannelMemberDocument>('ChannelMember', channelMemberSchema);
