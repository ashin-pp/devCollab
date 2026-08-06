import { inject, injectable } from "tsyringe";
import type { VerifyPaymentRequestDto } from "../../dtos/payment/request/verify-payment.dto";
import type { UserProfileResponseDto } from "../../dtos/user/response/user-profile.response.dto";
import type { IPaymentTransactionRepository } from "../../interfaces/repositories/payment-transaction.repository.interface";
import type { IPlanRepository } from "../../interfaces/repositories/plan.repository.interface";
import type { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import type { IWalletLedgerRepository } from "../../interfaces/repositories/wallet-ledger.repository.interface";
import type { IPaymentService } from "../../interfaces/services/payment.service.interface";
import type { ISelectUserPlanUseCase } from "../../interfaces/use-cases/user/select-user-plan.usecase.interface";
import type { IVerifyPaymentUseCase } from "../../interfaces/use-cases/payment/verify-payment.usecase.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { isFreePlan } from "../../../domain/utils/is-free-plan";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";
import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";

@injectable()
export class VerifyPaymentUseCase implements IVerifyPaymentUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private readonly _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IPlanRepository) private readonly _planRepository: IPlanRepository,
        @inject(REPOSITORY_TOKENS.IPaymentTransactionRepository)
        private readonly _paymentTransactionRepository: IPaymentTransactionRepository,
        @inject(REPOSITORY_TOKENS.IWalletLedgerRepository)
        private readonly _walletLedgerRepository: IWalletLedgerRepository,
        @inject(SERVICE_TOKENS.IPaymentService) private readonly _paymentService: IPaymentService,
        @inject(USECASE_TOKENS.ISelectUserPlanUseCase)
        private readonly _selectUserPlanUseCase: ISelectUserPlanUseCase
    ) {}

    async execute(payload: {
        userId: string;
        data: VerifyPaymentRequestDto;
    }): Promise<UserProfileResponseDto> {
        if (!this._paymentService.isConfigured()) {
            throw new AppError(ErrorMessage.PAYMENT_NOT_CONFIGURED, HttpStatusCode.SERVICE_UNAVAILABLE);
        }

        const { planId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload.data;
        if (!planId?.trim() || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            throw new AppError(ErrorMessage.PAYMENT_VERIFY_FAILED, HttpStatusCode.BAD_REQUEST);
        }

        const plan = await this._planRepository.findById(planId.trim());
        if (!plan || !plan.id) {
            throw new AppError(ErrorMessage.PLAN_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        if (!plan.isActive) {
            throw new AppError(ErrorMessage.PLAN_INACTIVE, HttpStatusCode.BAD_REQUEST);
        }
        if (isFreePlan(plan)) {
            throw new AppError(ErrorMessage.FREE_PLAN_NO_PAYMENT, HttpStatusCode.BAD_REQUEST);
        }

        const signatureOk = this._paymentService.verifyPaymentSignature({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
        });
        if (!signatureOk) {
            throw new AppError(ErrorMessage.PAYMENT_SIGNATURE_INVALID, HttpStatusCode.BAD_REQUEST);
        }

        const order = await this._paymentService.fetchOrder(razorpay_order_id);
        const expectedPaise = Math.round(Number(plan.price) * 100);
        const notesUserId = order.notes.userId;
        const notesPlanId = order.notes.planId;

        if (
            notesUserId !== payload.userId ||
            notesPlanId !== plan.id ||
            Number(order.amount) !== expectedPaise
        ) {
            throw new AppError(ErrorMessage.PAYMENT_ORDER_MISMATCH, HttpStatusCode.BAD_REQUEST);
        }

        const user = await this._userRepository.findById(payload.userId);
        if (!user || !user.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        user.pruneExpiredPaidEntitlements();
        user.grantPaidPlanEntitlement({
            planId: plan.id,
            durationDays: plan.durationDays,
            paymentId: razorpay_payment_id,
        });

        const saved = await this._userRepository.update(user.id, user);
        if (!saved || !saved.id) {
            throw new AppError(ErrorMessage.FAILED_TO_UPDATE_PROFILE, HttpStatusCode.INTERNAL_SERVER);
        }

        const amount = Number(plan.price);
        const currency = (plan.currency || "INR").toUpperCase();

        const existingTxn = await this._paymentTransactionRepository.findByOrderId(razorpay_order_id);
        if (!existingTxn) {
            await this._paymentTransactionRepository.create({
                userId: payload.userId,
                planId: plan.id,
                planName: plan.name,
                amount,
                currency,
                status: "success",
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
            });
        }

        await this._walletLedgerRepository.creditIfAbsent({
            userId: payload.userId,
            planId: plan.id,
            planName: plan.name,
            amount,
            currency,
            type: "credit",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            description: `Plan purchase: ${plan.name}`,
        });

        return this._selectUserPlanUseCase.execute({
            userId: payload.userId,
            data: { planId: plan.id },
        });
    }
}
