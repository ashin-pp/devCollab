import mongoose, { Schema, Document } from "mongoose";
import { AIAgentType } from "../../../domain/enums/AIAgentType";

export interface IAIAgentModel extends Document {
    workspace_id: mongoose.Types.ObjectId;
    name: string;
    agent_type: AIAgentType;
    description: string;
    is_active: boolean;
    config: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

const AIAgentSchema: Schema = new Schema({
    workspace_id: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    name: { type: String, required: true },
    agent_type: { type: String, enum: Object.values(AIAgentType), required: true },
    description: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    config: { type: Object, default: {} }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const AIAgentModel = mongoose.model<IAIAgentModel>("AIAgent", AIAgentSchema, "ai_agents");
