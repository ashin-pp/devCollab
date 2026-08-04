import mongoose, { Schema, Document } from "mongoose";

export interface IPlanModel extends Document {
    name: string;
    price: number;
    currency: string;
    duration_days: number;
    max_workspaces: number;
    max_members_per_workspace: number;
    message_retention_days: number;
    ai_assistant_enabled: boolean;
    video_calls_enabled: boolean;
    multi_ai_agents: boolean;
    pin_board_enabled: boolean;
    created_by: mongoose.Types.ObjectId;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

const PlanSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        currency: { type: String, default: "INR" },
        duration_days: { type: Number, required: true },
        max_workspaces: { type: Number, required: true },
        max_members_per_workspace: { type: Number, required: true },
        message_retention_days: { type: Number, required: true },
        ai_assistant_enabled: { type: Boolean, default: false },
        video_calls_enabled: { type: Boolean, default: false },
        multi_ai_agents: { type: Boolean, default: false },
        pin_board_enabled: { type: Boolean, default: false },
        created_by: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
        is_active: { type: Boolean, default: true },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

export const PlanModel = mongoose.model<IPlanModel>("Plan", PlanSchema, "plans");
