import { isAxiosError } from 'axios';
import { PaymentService } from '../api/payment/payment.service';
import type { RazorpaySuccessResponse } from '../types/payment.types';
import { openRazorpayCheckout } from './razorpay';

export type PlanCheckoutResult =
  | { status: 'success'; verifyPayload: unknown }
  | { status: 'failed'; message: string };

/** Create order → open Razorpay → verify. Does not activate free plans. */
export async function checkoutAndVerifyPlan(plan: {
  id: string;
  name: string;
}): Promise<PlanCheckoutResult> {
  const order = await PaymentService.createOrder(plan.id);
  if (!order?.orderId || !order.keyId) {
    return { status: 'failed', message: 'Failed to create payment order' };
  }

  const payment = await new Promise<
    RazorpaySuccessResponse | { failed: string; outcome: 'cancelled' | 'failed' }
  >((resolve, reject) => {
    let settled = false;
    const settle = (
      value: RazorpaySuccessResponse | { failed: string; outcome: 'cancelled' | 'failed' }
    ) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    void openRazorpayCheckout({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'DevCollab',
      description: `${order.planName} plan`,
      order_id: order.orderId,
      theme: { color: '#0f172a' },
      onSuccess: (response) => settle(response),
      onDismiss: (info) =>
        settle({
          failed: info.message,
          outcome: info.kind === 'cancelled' ? 'cancelled' : 'failed',
        }),
    }).catch(reject);
  });

  if ('failed' in payment) {
    try {
      await PaymentService.recordAttempt({
        planId: plan.id,
        razorpayOrderId: order.orderId,
        status: payment.outcome,
      });
    } catch {
      /* history is best-effort; still return failure to UI */
    }
    return { status: 'failed', message: payment.failed };
  }

  try {
    const verifyRes = await PaymentService.verify({
      planId: plan.id,
      razorpay_order_id: payment.razorpay_order_id,
      razorpay_payment_id: payment.razorpay_payment_id,
      razorpay_signature: payment.razorpay_signature,
    });
    sessionStorage.setItem('preferredPlanId', plan.id);
    sessionStorage.setItem('preferredPlanName', plan.name);
    return { status: 'success', verifyPayload: verifyRes?.data ?? verifyRes };
  } catch (err: unknown) {
    let message = 'Payment verification failed';
    if (isAxiosError(err)) {
      message = err.response?.data?.error?.message || err.response?.data?.message || message;
    } else if (err instanceof Error && err.message) {
      message = err.message;
    }
    try {
      await PaymentService.recordAttempt({
        planId: plan.id,
        razorpayOrderId: order.orderId,
        status: 'failed',
      });
    } catch {
      /* ignore */
    }
    return { status: 'failed', message };
  }
}
