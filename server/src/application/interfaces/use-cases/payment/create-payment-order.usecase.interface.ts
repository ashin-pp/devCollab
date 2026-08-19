import type { CreatePaymentOrderRequestDto } from "../../../dtos/payment/request/create-payment-order.dto";
import type { CreatePaymentOrderResponseDto } from "../../../dtos/payment/response/create-payment-order.response.dto";

export interface ICreatePaymentOrderUseCase {
    execute(payload: {
        userId: string;
        data: CreatePaymentOrderRequestDto;
    }): Promise<CreatePaymentOrderResponseDto>;
}
