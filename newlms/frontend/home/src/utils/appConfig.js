// Central place that maps a logged-in user's role to the app (port) that
// owns that role's dashboard, and the shared backend API base URL.
//
// If you deploy behind real domains instead of localhost ports, just update
// these values (e.g. via Vite env vars) - nothing else needs to change.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export const APP_URLS = {
  ADMIN: import.meta.env.VITE_ADMIN_URL || 'http://localhost:5175',
  TUTOR: import.meta.env.VITE_TUTOR_URL || 'http://localhost:5174',
  HR: import.meta.env.VITE_TUTOR_URL || 'http://localhost:5174',
  STUDENT: import.meta.env.VITE_STUDENT_URL || 'http://localhost:5173',
  CANDIDATE: import.meta.env.VITE_STUDENT_URL || 'http://localhost:5173',
};

export const HOME_URL = import.meta.env.VITE_HOME_URL || 'http://localhost:5169';

/** Friendly label for a role, used in the UI. */
export function roleLabel(role) {
  switch ((role || '').toUpperCase()) {
    case 'ADMIN':
      return 'Administrator';
    case 'TUTOR':
    case 'HR':
      return 'Tutor';
    case 'STUDENT':
    case 'CANDIDATE':
      return 'Student';
    default:
      return role || 'User';
  }
}

/**
 * Resolves which app a given role should land on after login.
 * Falls back to the student app for any unrecognized role so nobody
 * gets stuck on the login screen after a successful authentication.
 */
export function resolveAppUrl(role) {
  const key = (role || '').toUpperCase();
  return APP_URLS[key] || APP_URLS.STUDENT;
}

/**
 * Builds the callback URL that the target app's <AuthCallback /> route
 * reads to persist the session, then redirects into its own dashboard.
 */
export function buildCallbackUrl(role, token, user) {
  const base = resolveAppUrl(role);
  const payload = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(user)))));
  return `${base}/auth/callback?token=${encodeURIComponent(token)}&user=${payload}`;
}
