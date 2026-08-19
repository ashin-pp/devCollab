import type { PaymentHistoryResponseDto } from "../../../dtos/payment/response/payment-history.response.dto";
import type { GetPaymentHistoryQueryDto } from "../../../dtos/payment/request/get-payment-history.dto";

export interface IGetPaymentHistoryUseCase {
    execute(payload: {
        userId: string;
        query?: GetPaymentHistoryQueryDto;
    }): Promise<PaymentHistoryResponseDto>;
}
