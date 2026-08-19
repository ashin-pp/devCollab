import { api } from '../axios';
import { API_ENDPOINTS } from '../../config/api.constants';
import type {
  CreatePaymentOrderResult,
  PaymentHistoryQuery,
  PaymentHistoryResult,
  RecordPaymentAttemptPayload,
  VerifyPaymentPayload,
} from '../../types/payment.types';

export const PaymentService = {
  createOrder: async (planId: string): Promise<CreatePaymentOrderResult> => {
    const response = await api.post(API_ENDPOINTS.PAYMENTS.CREATE_ORDER, { planId });
    return response.data?.data ?? response.data;
  },

  verify: async (payload: VerifyPaymentPayload) => {
    const response = await api.post(API_ENDPOINTS.PAYMENTS.VERIFY, payload);
    return response.data;
  },

  recordAttempt: async (payload: RecordPaymentAttemptPayload) => {
    const response = await api.post(API_ENDPOINTS.PAYMENTS.RECORD_ATTEMPT, payload);
    return response.data?.data ?? response.data;
  },

  getHistory: async (query: PaymentHistoryQuery = {}): Promise<PaymentHistoryResult> => {
    const response = await api.get(API_ENDPOINTS.PAYMENTS.HISTORY, {
      params: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        ...(query.status ? { status: query.status } : {}),
      },
    });
    const data = response.data?.data ?? response.data ?? {};
    return {
      items: Array.isArray(data.items) ? data.items : [],
      page: Number(data.page) || 1,
      limit: Number(data.limit) || 10,
      total: Number(data.total) || 0,
      totalPages: Number(data.totalPages) || 1,
    };
  },
};
