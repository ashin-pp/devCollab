import { NextFunction, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { CreatePaymentOrderRequestDto } from "../../application/dtos/payment/request/create-payment-order.dto";
import type { RecordPaymentAttemptRequestDto } from "../../application/dtos/payment/request/record-payment-attempt.dto";
import type { VerifyPaymentRequestDto } from "../../application/dtos/payment/request/verify-payment.dto";
import type { ICreatePaymentOrderUseCase } from "../../application/interfaces/use-cases/payment/create-payment-order.usecase.interface";
import type { IGetPaymentHistoryUseCase } from "../../application/interfaces/use-cases/payment/get-payment-history.usecase.interface";
import type { IRecordPaymentAttemptUseCase } from "../../application/interfaces/use-cases/payment/record-payment-attempt.usecase.interface";
import type { IVerifyPaymentUseCase } from "../../application/interfaces/use-cases/payment/verify-payment.usecase.interface";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SuccessMessage } from "../../domain/enums/SuccessMessage";
import { AppError } from "../../domain/errors/AppError";
import { USECASE_TOKENS } from "../../infrastructure/di/usecase.tokens";
import { ApiResponse } from "../http/helpers/implementation/apiResponse";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catch-async";

@injectable()
export class PaymentController {
    constructor(
        @inject(USECASE_TOKENS.ICreatePaymentOrderUseCase)
        private readonly _createPaymentOrderUseCase: ICreatePaymentOrderUseCase,
        @inject(USECASE_TOKENS.IVerifyPaymentUseCase)
        private readonly _verifyPaymentUseCase: IVerifyPaymentUseCase,
        @inject(USECASE_TOKENS.IGetPaymentHistoryUseCase)
        private readonly _getPaymentHistoryUseCase: IGetPaymentHistoryUseCase,
        @inject(USECASE_TOKENS.IRecordPaymentAttemptUseCase)
        private readonly _recordPaymentAttemptUseCase: IRecordPaymentAttemptUseCase
    ) {}

    public createOrder = catchAsync(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

        const body = req.body as CreatePaymentOrderRequestDto;
        const result = await this._createPaymentOrderUseCase.execute({
            userId,
            data: { planId: body.planId },
        });
        const response = ApiResponse.success(SuccessMessage.PAYMENT_ORDER_CREATED, result);
        res.status(HttpStatusCode.OK).json(response);
    });

    public verify = catchAsync(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

        const body = req.body as VerifyPaymentRequestDto;
        const profile = await this._verifyPaymentUseCase.execute({
            userId,
            data: {
                planId: body.planId,
                razorpay_order_id: body.razorpay_order_id,
                razorpay_payment_id: body.razorpay_payment_id,
                razorpay_signature: body.razorpay_signature,
            },
        });
        const response = ApiResponse.success(SuccessMessage.PAYMENT_VERIFIED, profile);
        res.status(HttpStatusCode.OK).json(response);
    });

    public recordAttempt = catchAsync(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

        const body = req.body as RecordPaymentAttemptRequestDto;
        const row = await this._recordPaymentAttemptUseCase.execute({
            userId,
            data: {
                planId: body.planId,
                razorpayOrderId: body.razorpayOrderId,
                status: body.status,
            },
        });
        const response = ApiResponse.success(SuccessMessage.PAYMENT_ATTEMPT_RECORDED, row);
        res.status(HttpStatusCode.OK).json(response);
    });

    public history = catchAsync(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

        const history = await this._getPaymentHistoryUseCase.execute({
            userId,
            query: {
                page: req.query.page ? Number(req.query.page) : undefined,
                limit: req.query.limit ? Number(req.query.limit) : undefined,
                status: req.query.status as "success" | "failed" | "cancelled" | undefined,
                planName: typeof req.query.planName === "string" ? req.query.planName : undefined,
            },
        });
        const response = ApiResponse.success(SuccessMessage.PAYMENT_HISTORY_FETCHED, history);
        res.status(HttpStatusCode.OK).json(response);
    });
}
