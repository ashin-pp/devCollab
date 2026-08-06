import type { VerifyPaymentRequestDto } from "../../../dtos/payment/request/verify-payment.dto";
import type { UserProfileResponseDto } from "../../../dtos/user/response/user-profile.response.dto";

export interface IVerifyPaymentUseCase {
    execute(payload: {
        userId: string;
        data: VerifyPaymentRequestDto;
    }): Promise<UserProfileResponseDto>;
}
