import type { PaymentTransactionStatus } from "../../../../domain/types/payment-transaction-status";

export interface RecordPaymentAttemptRequestDto {
    planId: string;
    razorpayOrderId: string;
    status: Extract<PaymentTransactionStatus, "failed" | "cancelled">;
}
