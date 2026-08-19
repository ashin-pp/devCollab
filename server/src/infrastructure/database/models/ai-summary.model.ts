import mongoose, { Schema, Document } from "mongoose";

export interface IAISummaryModel extends Document {
    workspace_id: mongoose.Types.ObjectId;
    channel_id: mongoose.Types.ObjectId;
    requested_by: mongoose.Types.ObjectId;
    agent_id: mongoose.Types.ObjectId;
    summary_text: string;
    from_message_id: mongoose.Types.ObjectId;
    to_message_id: mongoose.Types.ObjectId;
    period_start: Date;
    period_end: Date;
    is_pinned: boolean;
    created_at: Date;
}

const AISummarySchema: Schema = new Schema({
    workspace_id: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    channel_id: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
    requested_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    agent_id: { type: Schema.Types.ObjectId, ref: 'AIAgent', required: true },
    summary_text: { type: String, required: true },
    from_message_id: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
    to_message_id: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
    period_start: { type: Date, required: true },
    period_end: { type: Date, required: true },
    is_pinned: { type: Boolean, default: false }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

export const AISummaryModel = mongoose.model<IAISummaryModel>("AISummary", AISummarySchema, "ai_summaries");
