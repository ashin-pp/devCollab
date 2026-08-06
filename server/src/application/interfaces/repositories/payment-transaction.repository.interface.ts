import { PaymentTransaction } from "../../../domain/entities/payment-transaction.entity";
import type { PaymentTransactionStatus } from "../../../domain/types/payment-transaction-status";

export interface PaymentHistoryQuery {
    page: number;
    limit: number;
    status?: PaymentTransactionStatus;
    planName?: string;
}

export interface PaymentHistoryPage {
    items: PaymentTransaction[];
    total: number;
    planNames: string[];
}

export interface IPaymentTransactionRepository {
    create(transaction: Partial<PaymentTransaction>): Promise<PaymentTransaction>;
    findByOrderId(orderId: string): Promise<PaymentTransaction | null>;
    findByUserIdPaginated(userId: string, query: PaymentHistoryQuery): Promise<PaymentHistoryPage>;
}
