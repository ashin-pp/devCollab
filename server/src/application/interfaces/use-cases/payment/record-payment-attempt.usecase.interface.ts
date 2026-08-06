import type { RecordPaymentAttemptRequestDto } from "../../../dtos/payment/request/record-payment-attempt.dto";
import type { PaymentTransactionResponseDto } from "../../../dtos/payment/response/payment-transaction.response.dto";

export interface IRecordPaymentAttemptUseCase {
    execute(payload: {
        userId: string;
        data: RecordPaymentAttemptRequestDto;
    }): Promise<PaymentTransactionResponseDto>;
}
