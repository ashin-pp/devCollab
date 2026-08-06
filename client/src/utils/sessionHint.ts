/** Local hint that an HttpOnly refresh cookie may exist (JS can't read the cookie). */
const USER_SESSION_KEY = 'dc_has_user_session';
const ADMIN_SESSION_KEY = 'dc_has_admin_session';

export function markUserSession() {
  localStorage.setItem(USER_SESSION_KEY, '1');
}

export function clearUserSession() {
  localStorage.removeItem(USER_SESSION_KEY);
}

export function hasUserSession() {
  return localStorage.getItem(USER_SESSION_KEY) === '1';
}

export function markAdminSession() {
  localStorage.setItem(ADMIN_SESSION_KEY, '1');
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function hasAdminSession() {
  return localStorage.getItem(ADMIN_SESSION_KEY) === '1';
}
