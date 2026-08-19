export interface AdminWalletLedgerItemDto {
    id: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    type: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    description?: string;
    createdAt: string;
}

export interface AdminWalletResponseDto {
    balance: number;
    currency: string;
    creditCount: number;
    debitCount: number;
    items: AdminWalletLedgerItemDto[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
