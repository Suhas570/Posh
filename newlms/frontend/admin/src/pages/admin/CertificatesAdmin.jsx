import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Search,
  Download,
  Eye,
  AlertTriangle,
  FileCheck2,
  FileX2,
  BadgeCheck,
  Ban,
  Lock,
  Loader2,
  ListFilter,
} from 'lucide-react';
import certificateAdminService from '../../services/certificateAdminService';

const StatCard = ({ label, value, icon: Icon, tone }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}>
      <Icon size={18} />
    </div>
    <div className="flex flex-col">
      <span className="text-lg font-black text-white leading-tight">{value ?? '—'}</span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
    </div>
  </div>
);

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  REVOKED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  INVALID: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

const TABS = [
  { id: 'certificates', label: 'Certificates' },
  { id: 'verifications', label: 'Verification Logs' },
  { id: 'downloads', label: 'Download Logs' },
];

const CertificatesAdmin = () => {
  const authed = certificateAdminService.isAuthenticated();

  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('certificates');

  const [certificates, setCertificates] = useState([]);
  const [certPage, setCertPage] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [verificationLogs, setVerificationLogs] = useState([]);
  const [downloadLogs, setDownloadLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');

  const loadStats = async () => {
    try {
      const data = await certificateAdminService.getStats();
      setStats(data);
    } catch (err) {
      setError(err?.response?.status === 401 || err?.response?.status === 403 ? 'AUTH' : 'STATS_FAILED');
    }
  };

  const loadCertificates = async (page = 1) => {
    setLoading(true);
    try {
      const data = await certificateAdminService.listCertificates({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page,
      });
      setCertificates(data.items);
      setCertPage({ page: data.page, totalPages: data.totalPages });
      setError(null);
    } catch (err) {
      setError(err?.response?.status === 401 || err?.response?.status === 403 ? 'AUTH' : 'LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  };

  const loadVerificationLogs = async () => {
    setLoading(true);
    try {
      const data = await certificateAdminService.getVerificationLogs();
      setVerificationLogs(data.items);
      setError(null);
    } catch (err) {
      setError(err?.response?.status === 401 || err?.response?.status === 403 ? 'AUTH' : 'LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  };

  const loadDownloadLogs = async () => {
    setLoading(true);
    try {
      const data = await certificateAdminService.getDownloadLogs();
      setDownloadLogs(data.items);
      setError(null);
    } catch (err) {
      setError(err?.response?.status === 401 || err?.response?.status === 403 ? 'AUTH' : 'LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authed) {
      setError('AUTH');
      setLoading(false);
      return;
    }
    loadStats();
    loadCertificates(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authed) return;
    if (tab === 'certificates') loadCertificates(1);
    if (tab === 'verifications') loadVerificationLogs();
    if (tab === 'downloads') loadDownloadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadCertificates(1);
  };

  const handleRevoke = async () => {
    if (!revokeReason.trim()) return;
    try {
      await certificateAdminService.revokeCertificate(revokeTarget.id, revokeReason.trim());
      setCertificates((prev) => prev.map((c) => (c.id === revokeTarget.id ? { ...c, status: 'REVOKED' } : c)));
      setRevokeTarget(null);
      setRevokeReason('');
    } catch (err) {
      alert('Failed to revoke certificate.');
    }
  };

  if (error === 'AUTH') {
    return (
      <div className="flex flex-col gap-6 text-left">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-xl font-black tracking-tight text-white">Certificate Management</h1>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
          <Lock className="text-amber-400" size={26} />
          <h3 className="text-sm font-extrabold text-white">HR/Admin sign-in required</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Certificate analytics, verification logs, and download logs are protected endpoints. Sign in with an HR
            account (POST /api/auth/login) and store the returned token under the <code>lms_hr_token</code> key to
            view this dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="text-purple-400" size={20} /> Certificate Management
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Enterprise certificate generation, security, and verification analytics.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Generated" value={stats?.totalCertificatesGenerated} icon={FileCheck2} tone="bg-indigo-500/10 text-indigo-400" />
        <StatCard label="Downloaded" value={stats?.totalCertificatesDownloaded} icon={Download} tone="bg-sky-500/10 text-sky-400" />
        <StatCard label="Verifications" value={stats?.totalVerificationAttempts} icon={BadgeCheck} tone="bg-emerald-500/10 text-emerald-400" />
        <StatCard label="Ever Verified" value={stats?.certificatesWithAtLeastOneVerification} icon={Eye} tone="bg-teal-500/10 text-teal-400" />
        <StatCard label="Failed Attempts" value={stats?.failedVerificationAttempts} icon={AlertTriangle} tone="bg-amber-500/10 text-amber-400" />
        <StatCard label="Revoked/Tampered" value={(stats?.revokedCertificates || 0) + (stats?.tamperedCertificates || 0)} icon={FileX2} tone="bg-rose-500/10 text-rose-400" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === t.id ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'certificates' && (
        <>
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-800 text-slate-400 text-xs max-w-md flex-1 min-w-[220px]">
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by candidate, course, certificate ID, or serial no..."
                className="bg-transparent border-none outline-none text-slate-200 text-xs w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <ListFilter size={14} className="text-slate-500" />
              {['ALL', 'ACTIVE', 'REVOKED', 'INVALID'].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === s ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl">
              Search
            </button>
          </form>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wide text-[10px]">
                <tr>
                  <th className="px-4 py-3">Certificate ID</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Issued</th>
                  <th className="px-4 py-3">Verifications</th>
                  <th className="px-4 py-3">Downloads</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      <Loader2 className="animate-spin inline mr-2" size={14} /> Loading…
                    </td>
                  </tr>
                )}
                {!loading && certificates.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">No certificates found.</td>
                  </tr>
                )}
                {!loading &&
                  certificates.map((c) => (
                    <tr key={c.id} className="text-slate-300 hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-white">{c.certificateId}</td>
                      <td className="px-4 py-3">{c.candidateName}</td>
                      <td className="px-4 py-3">{c.courseName}</td>
                      <td className="px-4 py-3">{new Date(c.issueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{c.verificationCount}</td>
                      <td className="px-4 py-3">{c.downloadCount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${STATUS_STYLES[c.status] || STATUS_STYLES.ACTIVE}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.status === 'ACTIVE' && (
                          <button
                            onClick={() => setRevokeTarget(c)}
                            className="text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 text-[10px] font-bold"
                          >
                            <Ban size={12} /> Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {certPage.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: certPage.totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => loadCertificates(idx + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold ${
                    certPage.page === idx + 1 ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'verifications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wide text-[10px]">
              <tr>
                <th className="px-4 py-3">Certificate</th>
                <th className="px-4 py-3">Requested ID</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading…</td>
                </tr>
              )}
              {!loading && verificationLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No verification attempts yet.</td>
                </tr>
              )}
              {!loading &&
                verificationLogs.map((log) => (
                  <tr key={log.id} className="text-slate-300 hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-white">{log.certificate?.certificateId}</td>
                    <td className="px-4 py-3">{log.requestedCertId}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                          log.result === 'VALID' ? STATUS_STYLES.ACTIVE : STATUS_STYLES.REVOKED
                        }`}
                      >
                        {log.result}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{log.reason || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{log.ipAddress || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{new Date(log.verifiedAt).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'downloads' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wide text-[10px]">
              <tr>
                <th className="px-4 py-3">Certificate</th>
                <th className="px-4 py-3">Downloaded By</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Loading…</td>
                </tr>
              )}
              {!loading && downloadLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No downloads yet.</td>
                </tr>
              )}
              {!loading &&
                downloadLogs.map((log) => (
                  <tr key={log.id} className="text-slate-300 hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-white">{log.certificate?.certificateId}</td>
                    <td className="px-4 py-3">{log.downloadedBy || 'Unknown'}</td>
                    <td className="px-4 py-3 text-slate-400">{log.ipAddress || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{new Date(log.downloadedAt).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Revoke Modal */}
      {revokeTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full flex flex-col gap-4">
            <h3 className="text-sm font-black text-white">Revoke {revokeTarget.certificateId}?</h3>
            <p className="text-xs text-slate-400">This immediately invalidates the certificate for all future verification checks.</p>
            <textarea
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Reason for revocation (required)"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 min-h-[80px] outline-none focus:ring-2 focus:ring-rose-500/30"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setRevokeTarget(null); setRevokeReason(''); }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={!revokeReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50"
              >
                Revoke Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesAdmin;
