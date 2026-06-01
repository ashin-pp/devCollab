import mongoose, { Schema, Document } from "mongoose";

export interface IOtpModel extends Document {
    email: string;
    otp: string;
    is_used: boolean;
    expires_at: Date;
    created_at: Date;
}

const OtpSchema: Schema = new Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    is_used: { type: Boolean, default: false },
    expires_at: { type: Date, required: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

export const OtpModel = mongoose.model<IOtpModel>("otp_verifications", OtpSchema);
