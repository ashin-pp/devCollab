import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspaceModel extends Document {
    name: string;
    description?: string;
    logo?: string;
    invite_code: string;
    created_by: mongoose.Types.ObjectId;
    privacy: 'public' | 'private';
    max_members: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

const WorkspaceSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    logo: { type: String },
    invite_code: { type: String, required: true, unique: true },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    privacy: { type: String, enum: ['public', 'private'], default: 'private' },
    max_members: { type: Number, default: 50 },
    is_active: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const WorkspaceModel = mongoose.model<IWorkspaceModel>("Workspace", WorkspaceSchema);
