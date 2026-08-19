import type { PaymentTransactionStatus } from "../types/payment-transaction-status";

export class PaymentTransaction {
    constructor(
        public userId: string,
        public planId: string,
        public planName: string,
        public amount: number,
        public currency: string,
        public status: PaymentTransactionStatus,
        public razorpayOrderId: string,
        public razorpayPaymentId?: string,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) {}
}
