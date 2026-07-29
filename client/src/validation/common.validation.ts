const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 6;
export const OTP_LENGTH = 4;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isDigitOnly(value: string): boolean {
  return /^\d+$/.test(value);
}
