import { isValidEmail, OTP_LENGTH, PASSWORD_MIN_LENGTH } from './common.validation';

export type RegisterFieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function validateLoginCredentials(email: string, password: string): string | null {
  if (!email.trim() || !password.trim()) {
    return 'Email and password cannot be empty or just spaces.';
  }
  return null;
}

export function validateRegisterForm(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): { isValid: boolean; errors: RegisterFieldErrors } {
  const errors: RegisterFieldErrors = {};

  if (!input.name.trim()) {
    errors.name = 'Full Name is required';
  }

  if (!input.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(input.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!input.password) {
    errors.password = 'Password is required';
  } else if (input.password.trim().length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }

  if (!input.confirmPassword) {
    errors.confirmPassword = 'Confirm Password is required';
  } else if (input.password !== input.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateForgotPasswordEmail(email: string): string | null {
  if (!email.trim()) return 'Please enter your email address';
  if (!isValidEmail(email)) return 'Please enter a valid email address';
  return null;
}

export function validateResetPassword(
  newPassword: string,
  confirmPassword: string
): string | null {
  if (!newPassword.trim() || newPassword.trim().length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  if (newPassword !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
}

export function validateOtp(otp: string | string[], message = 'Please enter all 4 digits.'): string | null {
  const otpString = Array.isArray(otp) ? otp.join('') : otp;
  if (otpString.length !== OTP_LENGTH) return message;
  return null;
}
