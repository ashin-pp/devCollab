import mongoose, { Document, Schema } from "mongoose";
import type { PaymentTransactionStatus } from "../../../domain/types/payment-transaction-status";

export interface IPaymentTransactionModel extends Document {
    user_id: mongoose.Types.ObjectId;
    plan_id: mongoose.Types.ObjectId;
    plan_name: string;
    amount: number;
    currency: string;
    status: PaymentTransactionStatus;
    razorpay_order_id: string;
    razorpay_payment_id?: string;
    created_at: Date;
    updated_at: Date;
}

const PaymentTransactionSchema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        plan_id: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
        plan_name: { type: String, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        status: {
            type: String,
            enum: ["success", "failed", "cancelled"],
            required: true,
            index: true,
        },
        razorpay_order_id: { type: String, required: true, unique: true },
        razorpay_payment_id: { type: String },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

PaymentTransactionSchema.index({ user_id: 1, created_at: -1 });
PaymentTransactionSchema.index({ user_id: 1, status: 1, created_at: -1 });
PaymentTransactionSchema.index({ user_id: 1, plan_name: 1, created_at: -1 });

export const PaymentTransactionModel = mongoose.model<IPaymentTransactionModel>(
    "PaymentTransaction",
    PaymentTransactionSchema
);
