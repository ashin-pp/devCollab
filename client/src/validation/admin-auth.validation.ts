import { OTP_LENGTH } from './common.validation';

export function validateAdminForgotEmail(email: string): string | null {
  if (!email.trim()) return 'Admin identifier required';
  return null;
}

export function validateAdminOtp(otp: string | string[]): string | null {
  const otpString = Array.isArray(otp) ? otp.join('') : otp;
  if (otpString.length !== OTP_LENGTH) return 'Please enter a 4-digit code';
  return null;
}

export function validateAdminResetPassword(
  newPassword: string,
  confirmPassword: string
): string | null {
  if (!newPassword || !confirmPassword) return 'Please fill all fields';
  if (newPassword !== confirmPassword) return 'Security keys do not match';
  return null;
}
