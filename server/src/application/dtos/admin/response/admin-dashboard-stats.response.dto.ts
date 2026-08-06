export interface AdminDashboardStatsResponseDto {
    totalUsers: number;
    activeUsers: number;
    totalWorkspaces: number;
    activeWorkspaces: number;
    totalRevenue: number;
    currency: string;
    successPayments: number;
    failedPayments: number;
    cancelledPayments: number;
    revenueByDay: Array<{
        date: string;
        amount: number;
        count: number;
    }>;
    recentPayments: Array<{
        id: string;
        planName: string;
        amount: number;
        currency: string;
        status: string;
        userName?: string;
        userEmail?: string;
        createdAt: string;
    }>;
}
