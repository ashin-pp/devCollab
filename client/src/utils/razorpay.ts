import type { RazorpaySuccessResponse } from '../types/payment.types';

type RazorpayDismissReason =
  | undefined
  | 'timeout'
  | {
      error?: {
        description?: string;
        reason?: string;
        code?: string;
        step?: string;
        field?: string;
      };
    };

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  retry?: {
    enabled?: boolean;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: (reason?: RazorpayDismissReason) => void;
  };
};

type RazorpayInstance = {
  open: () => void;
  close: () => void;
  on: (
    event: 'payment.failed',
    handler: (response: {
      error?: { description?: string; reason?: string; code?: string };
    }) => void
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

const CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let checkoutScriptPromise: Promise<void> | null = null;

const loadRazorpayCheckout = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay checkout requires a browser'));
  }
  if (window.Razorpay) return Promise.resolve();
  if (checkoutScriptPromise) return checkoutScriptPromise;

  checkoutScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CHECKOUT_SCRIPT_URL}"]`
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')));
      return;
    }

    const script = document.createElement('script');
    script.src = CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      checkoutScriptPromise = null;
      reject(new Error('Failed to load Razorpay checkout'));
    };
    document.body.appendChild(script);
  });

  return checkoutScriptPromise;
};

export type CheckoutDismissInfo = {
  kind: 'cancelled' | 'timeout' | 'failed';
  message: string;
};

export const openRazorpayCheckout = async (
  options: Omit<RazorpayCheckoutOptions, 'handler' | 'modal' | 'retry'> & {
    onSuccess: (response: RazorpaySuccessResponse) => void;
    onDismiss?: (info: CheckoutDismissInfo) => void;
  }
): Promise<void> => {
  await loadRazorpayCheckout();
  if (!window.Razorpay) {
    throw new Error('Razorpay checkout is unavailable');
  }

  const { onSuccess, onDismiss, ...checkoutOptions } = options;
  let lastFailureMessage: string | null = null;

  const rzp = new window.Razorpay({
    ...checkoutOptions,
    // After fail/cancel, close checkout so ondismiss always runs (default retry keeps modal open).
    retry: { enabled: false },
    handler: onSuccess,
    modal: {
      ondismiss: (reason) => {
        if (lastFailureMessage) {
          onDismiss?.({ kind: 'failed', message: lastFailureMessage });
          return;
        }
        if (reason === 'timeout') {
          onDismiss?.({
            kind: 'timeout',
            message: 'Payment timed out. Please try again.',
          });
          return;
        }
        if (reason && typeof reason === 'object' && reason.error) {
          const message =
            reason.error.description ||
            reason.error.reason ||
            'Payment failed. Please try again.';
          onDismiss?.({ kind: 'failed', message });
          return;
        }
        onDismiss?.({
          kind: 'cancelled',
          message: 'You cancelled the payment. No charges were applied.',
        });
      },
    },
  });

  rzp.on('payment.failed', (response) => {
    lastFailureMessage =
      response.error?.description ||
      response.error?.reason ||
      'Payment failed. Please try again.';
    // Do not close here — with retry disabled Razorpay closes and fires ondismiss.
  });

  rzp.open();
};
