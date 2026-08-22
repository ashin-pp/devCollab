import { isAxiosError } from 'axios';
import { HttpStatusCode } from '../enums/HttpStatusCode';

export const isSubscriptionExpiredError = (err: unknown): boolean => {
  if (!isAxiosError(err) || err.response?.status !== HttpStatusCode.FORBIDDEN) {
    return false;
  }

  const payload = err.response.data as {
    message?: string;
    error?: { message?: string };
  } | undefined;

  const message = payload?.error?.message || payload?.message || '';
  return message.toLowerCase().includes('subscription has expired');
};
