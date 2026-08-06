import { AdminSalesReportResponseDto } from "../../../dtos/admin/response/admin-sales-report.response.dto";
import type { PaymentTransactionStatus } from "../../../../domain/types/payment-transaction-status";

export interface GetAdminSalesReportParams {
    page?: number;
    limit?: number;
    status?: PaymentTransactionStatus;
    planName?: string;
    from?: string;
    to?: string;
}

export interface IGetAdminSalesReportUseCase {
    execute(params: GetAdminSalesReportParams): Promise<AdminSalesReportResponseDto>;
}
