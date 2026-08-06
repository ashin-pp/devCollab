import mongoose, { Document, Schema } from "mongoose";
import type { WalletLedgerEntryType } from "../../../domain/entities/wallet-ledger-entry.entity";

export interface IWalletLedgerEntryModel extends Document {
    user_id: mongoose.Types.ObjectId;
    plan_id: mongoose.Types.ObjectId;
    plan_name: string;
    amount: number;
    currency: string;
    type: WalletLedgerEntryType;
    razorpay_order_id: string;
    razorpay_payment_id?: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}

const WalletLedgerEntrySchema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        plan_id: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
        plan_name: { type: String, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, required: true, default: "INR" },
        type: {
            type: String,
            enum: ["credit", "debit"],
            required: true,
            index: true,
        },
        razorpay_order_id: { type: String, required: true, unique: true },
        razorpay_payment_id: { type: String },
        description: { type: String },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

WalletLedgerEntrySchema.index({ created_at: -1 });
WalletLedgerEntrySchema.index({ type: 1, currency: 1 });

export const WalletLedgerEntryModel = mongoose.model<IWalletLedgerEntryModel>(
    "WalletLedgerEntry",
    WalletLedgerEntrySchema
);
