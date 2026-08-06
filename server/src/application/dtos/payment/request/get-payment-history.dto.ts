import type { PaymentTransactionStatus } from "../../../../domain/types/payment-transaction-status";

export interface GetPaymentHistoryQueryDto {
    page?: number;
    limit?: number;
    status?: PaymentTransactionStatus;
    planName?: string;
}
