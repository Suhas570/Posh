import axios from 'axios';

// ============================================================
// DEMO MODE CONFIGURATION
// ============================================================
// When DEMO_MODE is true, the client uses a fake demo token and
// does not require real JWT authentication. API 401 responses
// should NOT log the user out in demo mode.
// ============================================================
const DEMO_MODE = true;

const api = axios.create({
  baseURL: '/api', // Proxied by Vite to http://localhost:5000/api in development
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth failures globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // In DEMO_MODE, do NOT log the user out on 401 responses.
      // The demo session should persist so dashboards remain accessible.
      if (DEMO_MODE) {
        console.warn('API returned 401 but DEMO_MODE is enabled. Keeping demo session.');
        return Promise.reject(error);
      }

      console.warn('Session expired or unauthorized. Logging out.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are not on the login page, redirect to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;