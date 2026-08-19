import { isAxiosError } from 'axios';

export const isSubscriptionExpiredError = (err: unknown): boolean => {
  if (!isAxiosError(err) || err.response?.status !== 403) {
    return false;
  }

  const payload = err.response.data as {
    message?: string;
    error?: { message?: string };
  } | undefined;

  const message = payload?.error?.message || payload?.message || '';
  return message.toLowerCase().includes('subscription has expired');
};
