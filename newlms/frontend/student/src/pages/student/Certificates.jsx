import React, { useEffect, useState } from 'react';
import { Award, Download, ShieldCheck, Lock, RefreshCcw, ExternalLink, AlertTriangle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import certificateService from '../../services/certificateService';

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return value;
  }
};

const statusBadge = (status) => {
  if (status === 'REVOKED') return 'bg-rose-50 text-rose-600 border-rose-100';
  if (status === 'INVALID') return 'bg-rose-50 text-rose-600 border-rose-100';
  return 'bg-emerald-50 text-emerald-600 border-emerald-100';
};

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const loggedIn = certificateService.isAuthenticated();

  const loadCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await certificateService.getMyCertificates();
      setCertificates(data);
    } catch (err) {
      if (err?.response?.status === 401) {
        setError('AUTH');
      } else {
        setError('Unable to load your certificates right now. Please try again shortly.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      loadCertificates();
    } else {
      setLoading(false);
      setError('AUTH');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async (cert) => {
    setDownloadingId(cert.id);
    try {
      await certificateService.downloadCertificate(cert.id, cert.pdfFileName);
      setCertificates((prev) =>
        prev.map((c) => (c.id === cert.id ? { ...c, downloadCount: (c.downloadCount || 0) + 1 } : c))
      );
    } catch (err) {
      alert('Download failed. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="border-b border-slate-200/60 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-800">My Earned Certificates & Qualifications</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Secure, tamper-evident certificates issued automatically after you pass an assessment.
          </p>
        </div>
        {loggedIn && (
          <Button variant="ghost" size="sm" onClick={loadCertificates} icon={RefreshCcw} className="text-[11px]">
            Refresh
          </Button>
        )}
      </div>

      {loading && (
        <Card className="p-8 text-center text-xs font-bold text-slate-400">Loading your certificates…</Card>
      )}

      {!loading && error === 'AUTH' && (
        <Card className="p-8 flex flex-col items-center text-center gap-3 border-amber-100 bg-amber-50/40">
          <Lock className="text-amber-500" size={28} />
          <h3 className="text-sm font-extrabold text-slate-800">Sign in to view your certificates</h3>
          <p className="text-xs text-slate-500 max-w-md">
            Certificates are issued automatically once you pass an assessment on the exam portal. Sign in with your
            candidate account to see and download the certificates you've earned.
          </p>
        </Card>
      )}

      {!loading && error && error !== 'AUTH' && (
        <Card className="p-8 flex flex-col items-center text-center gap-3 border-rose-100 bg-rose-50/40">
          <AlertTriangle className="text-rose-500" size={28} />
          <p className="text-xs text-slate-600">{error}</p>
          <Button variant="outline" size="sm" onClick={loadCertificates}>Try again</Button>
        </Card>
      )}

      {!loading && !error && certificates.length === 0 && (
        <Card className="p-8 text-center text-xs font-bold text-slate-400">
          No certificates yet. Complete and pass an assessment to earn your first certificate.
        </Card>
      )}

      {!loading && !error && certificates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="p-5 flex flex-col justify-between border-slate-200/50 bg-white">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Award size={22} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusBadge(cert.status)}`}>
                    {cert.status}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-extrabold text-slate-800">{cert.courseName}</h3>
                  <p className="text-xs text-slate-500 font-medium">Trainer: {cert.trainerName}</p>
                  <p className="text-[10px] text-slate-400 font-bold">Certificate ID: {cert.certificateId}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-2">
                  {cert.grade && (
                    <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      Grade {cert.grade}
                    </span>
                  )}
                  {cert.scorePercentage != null && (
                    <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {cert.scorePercentage.toFixed(1)}% Score
                    </span>
                  )}
                  <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck size={10} /> {cert.verificationCount || 0} verifications
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">Issued {formatDate(cert.issueDate)}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedCert(cert)} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-[10px] font-extrabold">
                    View
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={downloadingId === cert.id}
                    onClick={() => handleDownload(cert)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold"
                  >
                    <Download size={14} className="mr-1" /> Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Certificate Detail Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-xl w-full shadow-2xl flex flex-col gap-6 text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
              <Award size={36} />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Certificate of Completion</span>
              <h2 className="text-xl font-black text-slate-800">This certifies that {selectedCert.candidateName}</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                has successfully completed <span className="font-bold text-slate-800">{selectedCert.courseName}</span> under
                the guidance of {selectedCert.trainerName}.
              </p>
            </div>

            <div className="flex justify-around border-y border-slate-100 py-4 text-xs font-bold text-slate-600">
              <div>Issued: {formatDate(selectedCert.issueDate)}</div>
              <div>Grade: {selectedCert.grade || '—'}</div>
              <div>Cert ID: {selectedCert.certificateId}</div>
            </div>

            <a
              href={selectedCert.verificationUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-indigo-600 flex items-center justify-center gap-1 hover:underline"
            >
              Verify this certificate online <ExternalLink size={12} />
            </a>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                isLoading={downloadingId === selectedCert.id}
                onClick={() => handleDownload(selectedCert)}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-extrabold"
              >
                <Download size={14} className="mr-1" /> Download PDF
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedCert(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-extrabold"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
