import mongoose, { Schema, Document } from "mongoose";

export interface IAIReminderModel extends Document {
    user_id: mongoose.Types.ObjectId;
    workspace_id: mongoose.Types.ObjectId;
    channel_id: mongoose.Types.ObjectId;
    agent_id?: mongoose.Types.ObjectId;
    message_id?: mongoose.Types.ObjectId;
    sender_id?: mongoose.Types.ObjectId;
    content: string;
    remind_at: Date;
    is_sent: boolean;
    created_at: Date;
}
const AIReminderSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
workspace_id: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
channel_id: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
agent_id: { type: Schema.Types.ObjectId, ref: 'AIAgent' },
message_id: { type: Schema.Types.ObjectId, ref: 'Message' },
sender_id: { type: Schema.Types.ObjectId, ref: 'User' },
content: { type: String, required: true },
remind_at: { type: Date, required: true },
is_sent: { type: Boolean, default: false }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

export const AIReminderModel = mongoose.model<IAIReminderModel>("AIReminder", AIReminderSchema, "ai_reminders");
