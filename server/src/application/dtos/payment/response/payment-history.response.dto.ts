import type { PaymentTransactionResponseDto } from "./payment-transaction.response.dto";

export interface PaymentHistoryResponseDto {
    items: PaymentTransactionResponseDto[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    planNames: string[];
}
