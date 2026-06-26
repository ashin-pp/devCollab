import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspaceMemberModel extends Document {
    workspace_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    role: 'owner' | 'member';
    status: 'pending' | 'approved' | 'blocked' | 'invited';
    joined_at: Date;
}

const WorkspaceMemberSchema: Schema = new Schema({
    workspace_id: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'member'], default: 'member' },
    status: { type: String, enum: ['pending', 'approved', 'blocked', 'invited'], default: 'approved' }
}, {
    timestamps: { createdAt: 'joined_at', updatedAt: false }
});

// Ensure a user cannot be added to the exact same workspace twice
WorkspaceMemberSchema.index({ workspace_id: 1, user_id: 1 }, { unique: true });

export const WorkspaceMemberModel = mongoose.model<IWorkspaceMemberModel>("WorkspaceMember", WorkspaceMemberSchema);
