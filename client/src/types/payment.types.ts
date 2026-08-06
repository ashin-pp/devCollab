export interface CreatePaymentOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planId: string;
  planName: string;
}

export interface VerifyPaymentPayload {
  planId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export type PaymentTransactionStatus = 'success' | 'failed' | 'cancelled';

export interface PaymentTransaction {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: PaymentTransactionStatus;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export interface PaymentHistoryResult {
  items: PaymentTransaction[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaymentHistoryQuery {
  page?: number;
  limit?: number;
  status?: PaymentTransactionStatus | '';
}

export interface RecordPaymentAttemptPayload {
  planId: string;
  razorpayOrderId: string;
  status: Extract<PaymentTransactionStatus, 'failed' | 'cancelled'>;
}
