import { PaymentTransaction } from "../../../domain/entities/payment-transaction.entity";
import type { IPaymentTransactionModel } from "../models/payment-transaction.model";

export class PaymentTransactionMapper {
    toDomain(persistence: IPaymentTransactionModel): PaymentTransaction {
        return new PaymentTransaction(
            persistence.user_id.toString(),
            persistence.plan_id.toString(),
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
