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

export interface AdminPaymentQuery {
    page: number;
    limit: number;
    status?: PaymentTransactionStatus;
    planName?: string;
    from?: Date;
    to?: Date;
}

export type AdminPaymentRow = PaymentTransaction & {
    userName?: string;
    userEmail?: string;
};

export interface AdminPaymentPage {
    items: AdminPaymentRow[];
    total: number;
    planNames: string[];
}

export interface PaymentRevenueStats {
    totalRevenue: number;
    successCount: number;
    failedCount: number;
    cancelledCount: number;
    currency: string;
}

export interface RevenueDayBucket {
    date: string;
    amount: number;
    count: number;
}

export interface IPaymentTransactionRepository {
    create(transaction: Partial<PaymentTransaction>): Promise<PaymentTransaction>;
    findByOrderId(orderId: string): Promise<PaymentTransaction | null>;
    findByUserIdPaginated(userId: string, query: PaymentHistoryQuery): Promise<PaymentHistoryPage>;
    findAllPaginatedForAdmin(query: AdminPaymentQuery): Promise<AdminPaymentPage>;
    getRevenueStats(): Promise<PaymentRevenueStats>;
    getRevenueByDay(range: { from: Date; to: Date }): Promise<RevenueDayBucket[]>;
    getRecentForAdmin(limit: number): Promise<AdminPaymentRow[]>;
}
