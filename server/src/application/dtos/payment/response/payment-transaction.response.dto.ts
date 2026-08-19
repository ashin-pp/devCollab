import type { PaymentTransactionStatus } from "../../../../domain/types/payment-transaction-status";

export interface PaymentTransactionResponseDto {
    id: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    status: PaymentTransactionStatus;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    createdAt: string;
}
