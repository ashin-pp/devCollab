export type WalletLedgerEntryType = "credit" | "debit";

export class WalletLedgerEntry {
    constructor(
        public userId: string,
        public planId: string,
        public planName: string,
        public amount: number,
        public currency: string,
        public type: WalletLedgerEntryType,
        public razorpayOrderId: string,
        public razorpayPaymentId?: string,
        public description?: string,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) {}
}
