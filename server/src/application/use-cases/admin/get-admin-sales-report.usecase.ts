import { inject, injectable } from "tsyringe";
import type { IPaymentTransactionRepository } from "../../interfaces/repositories/payment-transaction.repository.interface";
import type {
    GetAdminSalesReportParams,
    IGetAdminSalesReportUseCase,
} from "../../interfaces/use-cases/admin/get-admin-sales-report.usecase.interface";
import { AdminSalesReportResponseDto } from "../../dtos/admin/response/admin-sales-report.response.dto";
import type { PaymentTransactionStatus } from "../../../domain/types/payment-transaction-status";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

const ALLOWED_STATUS = new Set<PaymentTransactionStatus>(["success", "failed", "cancelled"]);

@injectable()
export class GetAdminSalesReportUseCase implements IGetAdminSalesReportUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPaymentTransactionRepository)
        private readonly _paymentTransactionRepository: IPaymentTransactionRepository
    ) {}

    async execute(params: GetAdminSalesReportParams): Promise<AdminSalesReportResponseDto> {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(50, Math.max(1, params.limit || 10));
        const status =
            params.status && ALLOWED_STATUS.has(params.status) ? params.status : undefined;
        const from = parseDateBoundary(params.from, false);
        const to = parseDateBoundary(params.to, true);

        const [pageResult, summary] = await Promise.all([
            this._paymentTransactionRepository.findAllPaginatedForAdmin({
                page,
                limit,
                status,
                planName: params.planName?.trim() || undefined,
                from,
                to,
            }),
            this._paymentTransactionRepository.getRevenueStats(),
        ]);

        return {
            items: pageResult.items.map((item) => ({
                id: item.id ?? "",
                userId: item.userId,
                userName: item.userName,
                userEmail: item.userEmail,
                planId: item.planId,
                planName: item.planName,
                amount: item.amount,
                currency: item.currency,
                status: item.status,
                razorpayOrderId: item.razorpayOrderId,
                razorpayPaymentId: item.razorpayPaymentId,
                createdAt: (item.createdAt ?? new Date()).toISOString(),
            })),
            page,
            limit,
            total: pageResult.total,
            totalPages: Math.max(1, Math.ceil(pageResult.total / limit)),
            planNames: pageResult.planNames,
            summary: {
                totalRevenue: summary.totalRevenue,
                successCount: summary.successCount,
                failedCount: summary.failedCount,
                cancelledCount: summary.cancelledCount,
                currency: summary.currency,
            },
        };
    }
}

function parseDateBoundary(value: string | undefined, endOfDay: boolean): Date | undefined {
    if (!value?.trim()) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return undefined;
    if (endOfDay) {
        parsed.setUTCHours(23, 59, 59, 999);
    } else {
        parsed.setUTCHours(0, 0, 0, 0);
    }
    return parsed;
}
