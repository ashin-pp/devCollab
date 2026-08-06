export interface CreatePaymentOrderResponseDto {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    planId: string;
    planName: string;
}
