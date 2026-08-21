import axios from 'axios';

const API_BASE = 'http://localhost:5001/api/admin/certificates';

// HR/admin JWT. Set automatically after signing in via the common home app's
// login page (see /auth/callback). Falls back to the legacy manual key for
// anyone who was already using it directly.
const TOKEN_KEY = 'token';
const LEGACY_TOKEN_KEY = 'lms_hr_token';

const authHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const certificateAdminService = {
  isAuthenticated: () => Boolean(localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY)),

  getStats: async () => {
    const res = await axios.get(`${API_BASE}/stats`, { headers: authHeaders() });
    return res.data;
  },

  listCertificates: async (filters = {}) => {
    const res = await axios.get(API_BASE, { headers: authHeaders(), params: filters });
    return res.data;
  },

  getCertificate: async (id) => {
    const res = await axios.get(`${API_BASE}/${id}`, { headers: authHeaders() });
    return res.data.certificate;
  },

  getVerificationLogs: async (certificateId, page = 1) => {
    const res = await axios.get(`${API_BASE}/verification-logs`, {
      headers: authHeaders(),
      params: { certificateId, page },
    });
    return res.data;
  },

  getDownloadLogs: async (certificateId, page = 1) => {
    const res = await axios.get(`${API_BASE}/download-logs`, {
      headers: authHeaders(),
      params: { certificateId, page },
    });
    return res.data;
  },

  revokeCertificate: async (id, reason) => {
    const res = await axios.put(`${API_BASE}/${id}/revoke`, { reason }, { headers: authHeaders() });
    return res.data;
  },

  generateForExamResult: async (examResultId) => {
    const res = await axios.post(`${API_BASE}/generate/${examResultId}`, {}, { headers: authHeaders() });
    return res.data;
  },
};

export default certificateAdminService;
