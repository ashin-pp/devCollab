import { inject, injectable } from "tsyringe";
import type { GetPaymentHistoryQueryDto } from "../../dtos/payment/request/get-payment-history.dto";
import type { PaymentHistoryResponseDto } from "../../dtos/payment/response/payment-history.response.dto";
import type { IPaymentTransactionRepository } from "../../interfaces/repositories/payment-transaction.repository.interface";
import type { IGetPaymentHistoryUseCase } from "../../interfaces/use-cases/payment/get-payment-history.usecase.interface";
import type { PaymentTransactionStatus } from "../../../domain/types/payment-transaction-status";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

@injectable()
export class GetPaymentHistoryUseCase implements IGetPaymentHistoryUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPaymentTransactionRepository)
        private readonly _paymentTransactionRepository: IPaymentTransactionRepository
    ) {}

    async execute(payload: {
        userId: string;
        query?: GetPaymentHistoryQueryDto;
    }): Promise<PaymentHistoryResponseDto> {
        const page = Math.max(1, Number(payload.query?.page) || 1);
        const limit = Math.min(
            MAX_LIMIT,
            Math.max(1, Number(payload.query?.limit) || DEFAULT_LIMIT)
        );
        const status = normalizeStatus(payload.query?.status);
        const planName = payload.query?.planName?.trim() || undefined;

        const result = await this._paymentTransactionRepository.findByUserIdPaginated(
            payload.userId,
            { page, limit, status, planName }
        );

        const totalPages = Math.max(1, Math.ceil(result.total / limit) || 1);

        return {
            items: result.items.map((row) => ({
                id: row.id!,
                planId: row.planId,
                planName: row.planName,
                amount: row.amount,
                currency: row.currency,
                status: row.status,
                razorpayOrderId: row.razorpayOrderId,
                razorpayPaymentId: row.razorpayPaymentId,
                createdAt: (row.createdAt ?? new Date()).toISOString(),
            })),
            page,
            limit,
            total: result.total,
            totalPages,
            planNames: result.planNames,
        };
    }
}

function normalizeStatus(value?: string): PaymentTransactionStatus | undefined {
    if (value === "success" || value === "failed" || value === "cancelled") {
        return value;
    }
    return undefined;
}
