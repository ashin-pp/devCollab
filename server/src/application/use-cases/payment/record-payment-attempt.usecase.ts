import { inject, injectable } from "tsyringe";
import type { RecordPaymentAttemptRequestDto } from "../../dtos/payment/request/record-payment-attempt.dto";
import type { PaymentTransactionResponseDto } from "../../dtos/payment/response/payment-transaction.response.dto";
import type { IPaymentTransactionRepository } from "../../interfaces/repositories/payment-transaction.repository.interface";
import type { IPlanRepository } from "../../interfaces/repositories/plan.repository.interface";
import type { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import type { IRecordPaymentAttemptUseCase } from "../../interfaces/use-cases/payment/record-payment-attempt.usecase.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { isFreePlan } from "../../../domain/utils/is-free-plan";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class RecordPaymentAttemptUseCase implements IRecordPaymentAttemptUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private readonly _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IPlanRepository) private readonly _planRepository: IPlanRepository,
        @inject(REPOSITORY_TOKENS.IPaymentTransactionRepository)
        private readonly _paymentTransactionRepository: IPaymentTransactionRepository
    ) {}

    async execute(payload: {
        userId: string;
        data: RecordPaymentAttemptRequestDto;
    }): Promise<PaymentTransactionResponseDto> {
        const user = await this._userRepository.findById(payload.userId);
        if (!user || !user.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const status = payload.data.status;
        const planId = payload.data.planId.trim();
        const razorpayOrderId = payload.data.razorpayOrderId.trim();

        const existing = await this._paymentTransactionRepository.findByOrderId(razorpayOrderId);
        if (existing?.id) {
            return toDto(existing);
        }

        const plan = await this._planRepository.findById(planId);
        if (!plan || !plan.id) {
            throw new AppError(ErrorMessage.PLAN_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        if (isFreePlan(plan)) {
            throw new AppError(ErrorMessage.FREE_PLAN_NO_PAYMENT, HttpStatusCode.BAD_REQUEST);
        }

        const saved = await this._paymentTransactionRepository.create({
            userId: payload.userId,
            planId: plan.id,
            planName: plan.name,
            amount: Number(plan.price),
            currency: (plan.currency || "INR").toUpperCase(),
            status,
            razorpayOrderId,
        });

        return toDto(saved);
    }
}

function toDto(row: {
    id?: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    status: "success" | "failed" | "cancelled";
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    createdAt?: Date;
}): PaymentTransactionResponseDto {
    return {
        id: row.id!,
        planId: row.planId,
        planName: row.planName,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        razorpayOrderId: row.razorpayOrderId,
        razorpayPaymentId: row.razorpayPaymentId,
        createdAt: (row.createdAt ?? new Date()).toISOString(),
    };
}
