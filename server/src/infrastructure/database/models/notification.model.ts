import mongoose, { Schema, Document } from "mongoose";

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['POLL_CREATED', 'JOIN_REQUEST', 'JOIN_REQUEST_APPROVED', 'WORKSPACE_INVITE', 'GENERAL', 'WORKSPACE', 'CHANNEL', 'DIRECT_MESSAGE', 'MENTION'] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: String },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
