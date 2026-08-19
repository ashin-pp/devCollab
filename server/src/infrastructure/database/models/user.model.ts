import mongoose, { Schema, Document } from "mongoose";
import { SubscriptionStatus } from "../../../domain/enums/SubscriptionStatus";

export interface IUserModel extends Document {
    name: string;
    email: string;
    password?: string;
    profile_image?: string;
    bio?: string;
    skills: string[];
    subscription_status: SubscriptionStatus;
    github?: string;
    linkedin?: string;
    twitter?: string;
    location?: string;
    title?: string;
    plan_id?: mongoose.Types.ObjectId | null;
    plan_selected_at?: Date | null;
    paid_plan_entitlements?: Array<{
        plan_id: mongoose.Types.ObjectId;
        expires_at: Date;
        payment_id?: string;
    }>;
    google_id?: string;
    is_verified: boolean;
    status: string;
    last_seen?: Date;
    created_at: Date;
    updated_at: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    profile_image: { type: String },
    bio: { type: String },
    skills: { type: [String], default: [] },
    subscription_status: { 
        type: String, 
        enum: Object.values(SubscriptionStatus), 
        default: SubscriptionStatus.STARTER 
    },
    github: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    location: { type: String },
    title: { type: String },
    plan_id: { type: Schema.Types.ObjectId, ref: "Plan", default: null },
    plan_selected_at: { type: Date, default: null },
    paid_plan_entitlements: {
        type: [
            {
                plan_id: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
                expires_at: { type: Date, required: true },
                payment_id: { type: String },
                _id: false,
            },
        ],
        default: [],
    },
    google_id: { type: String },
    is_verified: { type: Boolean, default: false },
    status: { type: String, default: "active" },
    last_seen: { type: Date }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const UserModel = mongoose.model<IUserModel>("User", UserSchema);
