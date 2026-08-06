export interface AdminSalesReportItemDto {
    id: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    status: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    createdAt: string;
}

export interface AdminSalesReportResponseDto {
    items: AdminSalesReportItemDto[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    planNames: string[];
    summary: {
        totalRevenue: number;
        successCount: number;
        failedCount: number;
        cancelledCount: number;
        currency: string;
    };
}
