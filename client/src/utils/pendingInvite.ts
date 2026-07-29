const PENDING_INVITE_CODE_KEY = 'pendingInviteCode';
const PENDING_INVITE_EMAIL_KEY = 'pendingInviteEmail';

export function stashPendingInviteFromSearch(search: string): void {
  const params = new URLSearchParams(search);
  const inviteCode = params.get('inviteCode');
  const email = params.get('email');

  if (inviteCode) {
    sessionStorage.setItem(PENDING_INVITE_CODE_KEY, inviteCode);
  }
  if (email) {
    sessionStorage.setItem(PENDING_INVITE_EMAIL_KEY, email);
  }
}

export function getPendingInviteCode(): string | null {
  return sessionStorage.getItem(PENDING_INVITE_CODE_KEY);
}

export function getPendingInviteEmail(): string | null {
  return sessionStorage.getItem(PENDING_INVITE_EMAIL_KEY);
}

export function clearPendingInvite(): void {
  sessionStorage.removeItem(PENDING_INVITE_CODE_KEY);
  sessionStorage.removeItem(PENDING_INVITE_EMAIL_KEY);
}

export function pathAfterAuth(): string {
  const inviteCode = getPendingInviteCode();
  return inviteCode
    ? `/dashboard?inviteCode=${encodeURIComponent(inviteCode)}`
    : '/dashboard';
}
