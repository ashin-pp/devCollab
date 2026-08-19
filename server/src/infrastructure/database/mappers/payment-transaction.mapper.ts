import { PaymentTransaction } from "../../../domain/entities/payment-transaction.entity";
import type { IPaymentTransactionModel } from "../models/payment-transaction.model";

export class PaymentTransactionMapper {
    toDomain(persistence: IPaymentTransactionModel): PaymentTransaction {
        return new PaymentTransaction(
            resolveRefId(persistence.user_id),
            resolveRefId(persistence.plan_id),
            persistence.plan_name,
            persistence.amount,
            persistence.currency,
            persistence.status,
            persistence.razorpay_order_id,
            persistence.razorpay_payment_id,
            persistence._id ? persistence._id.toString() : undefined,
            persistence.created_at,
            persistence.updated_at
        );
    }

    toPersistence(domain: Partial<PaymentTransaction>): Record<string, unknown> {
        return Object.fromEntries(
            Object.entries({
                user_id: domain.userId,
                plan_id: domain.planId,
                plan_name: domain.planName,
                amount: domain.amount,
                currency: domain.currency,
                status: domain.status,
                razorpay_order_id: domain.razorpayOrderId,
                razorpay_payment_id: domain.razorpayPaymentId,
            }).filter(([, value]) => value !== undefined)
        );
    }
}

/** Handles ObjectId, populated docs, or null (deleted/missing populate target). */
export function resolveRefId(value: unknown): string {
    if (value == null) return "";
    if (typeof value === "object" && value !== null && "_id" in value) {
        const id = (value as { _id?: unknown })._id;
        return id == null ? "" : String(id);
    }
    return String(value);
}
