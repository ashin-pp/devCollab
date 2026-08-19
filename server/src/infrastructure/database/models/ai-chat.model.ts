import mongoose, { Schema, Document } from "mongoose";
import { AIAgentType } from "../../../domain/enums/AIAgentType";

export interface IAIChatModel extends Document {
    user_id: mongoose.Types.ObjectId;
    workspace_id: mongoose.Types.ObjectId;
    channel_id: mongoose.Types.ObjectId;
    command: AIAgentType;
    prompt: string;
    response: string;
    created_at: Date;
}

const AIChatSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workspace_id: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    channel_id: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
    command: { type: String, enum: Object.values(AIAgentType), required: true },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

export const AIChatModel = mongoose.model<IAIChatModel>("AIChat", AIChatSchema, "ai_chats");
