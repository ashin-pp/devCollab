import { isValidEmail } from './common.validation';

export function validateChangePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): string | null {
  if (!input.currentPassword || !input.newPassword) {
    return 'Please fill in all password fields';
  }
  if (input.newPassword !== input.confirmPassword) {
    return 'New passwords do not match';
  }
  return null;
}

export function validateNewEmail(newEmail: string, currentEmail: string): string | null {
  if (!newEmail.trim() || newEmail.trim() === currentEmail.trim()) {
    return 'Please enter a valid new email address';
  }
  if (!isValidEmail(newEmail)) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validateEmailChangeOtp(otp: string): string | null {
  if (!otp.trim()) return 'Please enter the OTP';
  return null;
}

/** Returns normalized skill if valid to add; otherwise null. */
export function normalizeSkillToAdd(skill: string, existing: string[]): string | null {
  const trimmed = skill.trim();
  if (!trimmed) return null;
  if (existing.includes(trimmed)) return null;
  return trimmed;
}
