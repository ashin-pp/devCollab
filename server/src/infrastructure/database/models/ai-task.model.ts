import mongoose, { Schema, Document } from "mongoose";
import { AITaskStatus } from "../../../domain/enums/AITaskStatus";

export interface IAITaskModel extends Document {
    workspace_id: mongoose.Types.ObjectId;
    channel_id: mongoose.Types.ObjectId;
    created_by: mongoose.Types.ObjectId;
    agent_id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    status: AITaskStatus;
    assigned_to: mongoose.Types.ObjectId;
    due_date: Date;
    created_at: Date;
    updated_at: Date;
}

const AITaskSchema: Schema = new Schema({
    workspace_id: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    channel_id: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    agent_id: { type: Schema.Types.ObjectId, ref: 'AIAgent', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: Object.values(AITaskStatus), default: AITaskStatus.OPEN },
    assigned_to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    due_date: { type: Date, required: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const AITaskModel = mongoose.model<IAITaskModel>("AITask", AITaskSchema, "ai_tasks");
