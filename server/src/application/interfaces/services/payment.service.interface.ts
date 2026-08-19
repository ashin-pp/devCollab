export interface IPaymentService {
    isConfigured(): boolean;
    createOrder(input: {
        amountPaise: number;
        currency: string;
        receipt: string;
        notes: Record<string, string>;
    }): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
    }>;
    verifyPaymentSignature(input: {
        orderId: string;
        paymentId: string;
        signature: string;
    }): boolean;
    fetchOrder(orderId: string): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        status: string;
        notes: Record<string, string>;
    }>;
}
