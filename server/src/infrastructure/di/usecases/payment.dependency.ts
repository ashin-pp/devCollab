import { container } from "tsyringe";
import { CreatePaymentOrderUseCase } from "../../../application/use-cases/payment/create-payment-order.usecase";
import { GetPaymentHistoryUseCase } from "../../../application/use-cases/payment/get-payment-history.usecase";
import { RecordPaymentAttemptUseCase } from "../../../application/use-cases/payment/record-payment-attempt.usecase";
import { VerifyPaymentUseCase } from "../../../application/use-cases/payment/verify-payment.usecase";
import { USECASE_TOKENS } from "../usecase.tokens";

export function registerPaymentUseCases() {
    container.register(USECASE_TOKENS.ICreatePaymentOrderUseCase, {
        useClass: CreatePaymentOrderUseCase,
    });
    container.register(USECASE_TOKENS.IVerifyPaymentUseCase, {
        useClass: VerifyPaymentUseCase,
    });
    container.register(USECASE_TOKENS.IGetPaymentHistoryUseCase, {
        useClass: GetPaymentHistoryUseCase,
    });
    container.register(USECASE_TOKENS.IRecordPaymentAttemptUseCase, {
        useClass: RecordPaymentAttemptUseCase,
    });
}
