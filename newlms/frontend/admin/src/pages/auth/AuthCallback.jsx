import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOME_URL } from '../../utils/appConfig';

/**
 * Reached as /auth/callback?token=...&user=<base64 json>
 * after a successful login on the common home app. Persists the session
 * into this app's localStorage (the same 'token' / 'user' keys the API
 * client already expects) and lands the user on the dashboard.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (!token || !userParam) {
      setError('Missing sign-in details. Please try logging in again.');
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(userParam)))));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/', { replace: true });
    } catch (e) {
      setError('Could not complete sign-in. Please try again.');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      {error ? (
        <div className="text-center">
          <p className="text-rose-600 font-medium mb-4">{error}</p>
          <a href={`${HOME_URL}/login`} className="text-brand-600 underline text-sm">
            Back to login
          </a>
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Signing you in…</p>
      )}
    </div>
  );
};

export default AuthCallback;
