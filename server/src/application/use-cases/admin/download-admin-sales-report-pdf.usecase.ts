import { inject, injectable } from "tsyringe";
import type { IPaymentTransactionRepository } from "../../interfaces/repositories/payment-transaction.repository.interface";
import type {
    DownloadAdminSalesReportPdfParams,
    DownloadAdminSalesReportPdfResult,
    IDownloadAdminSalesReportPdfUseCase,
} from "../../interfaces/use-cases/admin/download-admin-sales-report-pdf.usecase.interface";
import type { PaymentTransactionStatus } from "../../../domain/types/payment-transaction-status";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { buildAdminSalesReportPdf } from "../../../infrastructure/pdf/sales-report-pdf.builder";

const ALLOWED_STATUS = new Set<PaymentTransactionStatus>(["success", "failed", "cancelled"]);
const PDF_ROW_LIMIT = 2000;

@injectable()
export class DownloadAdminSalesReportPdfUseCase implements IDownloadAdminSalesReportPdfUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPaymentTransactionRepository)
        private readonly _paymentTransactionRepository: IPaymentTransactionRepository
    ) {}

    async execute(params: DownloadAdminSalesReportPdfParams): Promise<DownloadAdminSalesReportPdfResult> {
        const status =
            params.status && ALLOWED_STATUS.has(params.status as PaymentTransactionStatus)
                ? (params.status as PaymentTransactionStatus)
                : undefined;
        const from = parseDateBoundary(params.from, false);
        const to = parseDateBoundary(params.to, true);

        const [pageResult, summary] = await Promise.all([
            this._paymentTransactionRepository.findAllPaginatedForAdmin({
                page: 1,
                limit: PDF_ROW_LIMIT,
                status,
                planName: params.planName?.trim() || undefined,
                from,
                to,
            }),
            this._paymentTransactionRepository.getRevenueStats(),
        ]);

        if (pageResult.items.length === 0) {
            throw new AppError(ErrorMessage.SALES_REPORT_EMPTY, HttpStatusCode.BAD_REQUEST);
        }

        const items = pageResult.items.map((item) => ({
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
        }));

        const buffer = await buildAdminSalesReportPdf({
            items,
            summary: {
                totalRevenue: summary.totalRevenue,
                successCount: summary.successCount,
                failedCount: summary.failedCount,
                cancelledCount: summary.cancelledCount,
                currency: summary.currency,
            },
            filters: {
                status: status ?? "ALL",
                planName: params.planName?.trim() || "ALL",
                from: params.from?.trim() || "—",
                to: params.to?.trim() || "—",
            },
        });

        const stamp = new Date().toISOString().slice(0, 10);
        return { buffer, filename: `devcollab-sales-report-${stamp}.pdf` };
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
