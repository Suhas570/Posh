import axios from 'axios';

// Base URL of the LMS backend REST API (Express server, see backend/.env PORT).
const API_BASE = 'http://localhost:5001/api';

// The candidate JWT is issued by POST /api/auth/login for CANDIDATE accounts
// and stored under this key once the assessment portal login flow is used.
const TOKEN_KEY = 'lms_candidate_token';

const authHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const certificateService = {
  isAuthenticated: () => Boolean(localStorage.getItem(TOKEN_KEY)),

  // Fetch every certificate earned by the logged-in candidate
  getMyCertificates: async () => {
    const res = await axios.get(`${API_BASE}/certificates/my`, { headers: authHeaders() });
    return res.data.certificates || [];
  },

  // Fetch a single certificate's full detail
  getCertificate: async (id) => {
    const res = await axios.get(`${API_BASE}/certificates/${id}`, { headers: authHeaders() });
    return res.data.certificate;
  },

  // Downloads the certificate PDF as a Blob and triggers a browser save-as, recording a download log server-side
  downloadCertificate: async (id, fileName) => {
    const res = await axios.get(`${API_BASE}/certificates/${id}/download`, {
      headers: authHeaders(),
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'certificate.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Public verification lookup - no authentication required
  verifyCertificate: async (certificateId) => {
    const res = await axios.get(`${API_BASE}/verify/${encodeURIComponent(certificateId)}`);
    return res.data;
  },
};

export default certificateService;
