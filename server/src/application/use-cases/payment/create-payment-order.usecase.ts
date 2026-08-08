import { inject, injectable } from "tsyringe";
import type { CreatePaymentOrderRequestDto } from "../../dtos/payment/request/create-payment-order.dto";
import type { CreatePaymentOrderResponseDto } from "../../dtos/payment/response/create-payment-order.response.dto";
import type { IPlanRepository } from "../../interfaces/repositories/plan.repository.interface";
import type { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import type { IPaymentService } from "../../interfaces/services/payment.service.interface";
import type { ICreatePaymentOrderUseCase } from "../../interfaces/use-cases/payment/create-payment-order.usecase.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { isFreePlan } from "../../../domain/utils/is-free-plan";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class CreatePaymentOrderUseCase implements ICreatePaymentOrderUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private readonly _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IPlanRepository) private readonly _planRepository: IPlanRepository,
        @inject(SERVICE_TOKENS.IPaymentService) private readonly _paymentService: IPaymentService
    ) {}

    async execute(payload: {
        userId: string;
        data: CreatePaymentOrderRequestDto;
    }): Promise<CreatePaymentOrderResponseDto> {
        if (!this._paymentService.isConfigured()) {
            throw new AppError(ErrorMessage.PAYMENT_NOT_CONFIGURED, HttpStatusCode.SERVICE_UNAVAILABLE);
        }

        const user = await this._userRepository.findById(payload.userId);
        if (!user || !user.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const planId = payload.data.planId.trim();

        const plan = await this._planRepository.findById(planId);
        if (!plan || !plan.id) {
            throw new AppError(ErrorMessage.PLAN_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        if (!plan.isActive) {
            throw new AppError(ErrorMessage.PLAN_INACTIVE, HttpStatusCode.BAD_REQUEST);
        }
        if (isFreePlan(plan)) {
            throw new AppError(ErrorMessage.FREE_PLAN_NO_PAYMENT, HttpStatusCode.BAD_REQUEST);
        }

        user.pruneExpiredPaidEntitlements();
        if (user.getActivePaidEntitlement(plan.id)) {
            throw new AppError(ErrorMessage.PLAN_ALREADY_ENTITLED, HttpStatusCode.BAD_REQUEST);
        }

        const currency = (plan.currency || "INR").toUpperCase();
        const amountPaise = Math.round(Number(plan.price) * 100);
        if (!Number.isFinite(amountPaise) || amountPaise < 100) {
            throw new AppError(ErrorMessage.PAYMENT_ORDER_FAILED, HttpStatusCode.BAD_REQUEST);
        }

        const order = await this._paymentService.createOrder({
            amountPaise,
            currency,
            receipt: `plan_${plan.id}_${Date.now()}`.slice(0, 40),
            notes: {
                userId: user.id,
                planId: plan.id,
                planName: plan.name,
            },
        });

        return {
            orderId: order.orderId,
            amount: order.amount,
            currency: order.currency,
            keyId: order.keyId,
            planId: plan.id,
            planName: plan.name,
        };
    }
}
