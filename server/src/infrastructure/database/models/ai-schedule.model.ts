import mongoose, { Document, Schema } from "mongoose";
import type { AIScheduleStatus } from "../../../domain/entities/ai-schedule.entity";

export interface IAIScheduleModel extends Document {
    organizer_id: mongoose.Types.ObjectId;
    participant_id: mongoose.Types.ObjectId;
    workspace_id: mongoose.Types.ObjectId;
    channel_id: mongoose.Types.ObjectId;
    title: string;
    starts_at: Date;
    ends_at: Date;
    status: AIScheduleStatus;
    meet_link?: string;
    google_event_id?: string;
    reminder_sent: boolean;
    created_at: Date;
    updated_at: Date;
}

const AIScheduleSchema = new Schema(
    {
        organizer_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        participant_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        workspace_id: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
        channel_id: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
        title: { type: String, required: true },
        starts_at: { type: Date, required: true, index: true },
        ends_at: { type: Date, required: true },
        status: {
            type: String,
            enum: ["scheduled", "cancelled", "completed"],
            default: "scheduled",
            index: true,
        },
        meet_link: { type: String },
        google_event_id: { type: String },
        reminder_sent: { type: Boolean, default: false },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

export const AIScheduleModel = mongoose.model<IAIScheduleModel>(
    "AISchedule",
    AIScheduleSchema,
    "ai_schedules"
);
