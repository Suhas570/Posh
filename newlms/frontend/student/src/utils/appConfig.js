// Where the common login/home app lives. If a visitor lands here without a
// valid session, we bounce them back to this URL to sign in.
export const HOME_URL = import.meta.env.VITE_HOME_URL || 'http://localhost:5169';

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
