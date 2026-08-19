import { isValidEmail } from './common.validation';

export function validateInviteEmail(email: string): string | null {
  if (!email.trim() || !isValidEmail(email)) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validateWorkspaceInviteCode(code: string): string | null {
  if (!code.trim()) return 'Please enter a workspace invite code';
  return null;
}
