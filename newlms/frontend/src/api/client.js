import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5001', // pointing to our newly integrated port 5001
  headers: {
    'Content-Type': 'application/json'
  }
});

// Inject JWT Auth Token into every outgoing API request
apiClient.interceptors.request.use(
  (config) => {
    let token = null;
    if (config.url && config.url.includes('/api/hr')) {
      token = localStorage.getItem('assessment_tutor_token');
    } else if (config.url && config.url.includes('/api/candidate')) {
      token = localStorage.getItem('assessment_student_token');
    } else {
      token = localStorage.getItem('assessment_tutor_token') || localStorage.getItem('assessment_student_token');
    }
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Catch auth failures (401/403) and redirect if needed
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (error.config && error.config.url) {
        if (error.config.url.includes('/api/hr')) {
          localStorage.removeItem('assessment_tutor_token');
          localStorage.removeItem('assessment_tutor_user');
        } else if (error.config.url.includes('/api/candidate')) {
          localStorage.removeItem('assessment_student_token');
          localStorage.removeItem('assessment_student_user');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
