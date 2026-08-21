import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ShieldX, Search, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return value;
  }
};

const STATUS_META = {
  VALID: { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', label: 'Certificate Verified' },
  TAMPERED: { icon: ShieldX, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', label: 'Certificate Invalid / Tampered' },
  REVOKED: { icon: ShieldX, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', label: 'Certificate Revoked' },
  NOT_FOUND: { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', label: 'Certificate Not Found' },
  INVALID: { icon: ShieldX, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', label: 'Certificate Invalid' },
};

const VerifyCertificate = () => {
  const { certificateId: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const [inputId, setInputId] = useState(routeId || '');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const runVerification = async (id) => {
    if (!id || !id.trim()) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const fp = searchParams.get('fp');
      const url = `${API_BASE}/verify/${encodeURIComponent(id.trim())}${fp ? `?fp=${encodeURIComponent(fp)}` : ''}`;
      const res = await axios.get(url);
      setResponse(res.data);
    } catch (err) {
      if (err?.response?.data) {
        setResponse(err.response.data);
      } else {
        setError('Verification service is unavailable right now. Please try again shortly.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeId) runVerification(routeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  const meta = response ? STATUS_META[response.status] || STATUS_META.INVALID : null;
  const Icon = meta?.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 p-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-lg font-black text-slate-800">Certificate Verification</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter a certificate ID, or scan the QR / barcode printed on the certificate, to confirm its authenticity.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runVerification(inputId);
          }}
          className="flex gap-2"
        >
          <input
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="e.g. LMS-2026-JAVA-000001"
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl px-4 py-2.5 text-xs font-extrabold flex items-center gap-1.5"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Verify
          </button>
        </form>

        {error && <p className="text-xs text-rose-500 text-center font-semibold">{error}</p>}

        {response && meta && (
          <div className={`rounded-2xl border p-5 flex flex-col gap-4 ${meta.bg}`}>
            <div className="flex items-center gap-2 justify-center">
              <Icon className={meta.color} size={22} />
              <span className={`text-sm font-black ${meta.color}`}>{meta.label}</span>
            </div>
            <p className="text-xs text-slate-600 text-center">{response.message}</p>

            {response.certificate && (
              <div className="bg-white/70 rounded-xl border border-white p-4 flex flex-col gap-2 text-xs text-slate-700">
                <Row label="Candidate" value={response.certificate.candidateName} />
                <Row label="Course / Assessment" value={response.certificate.courseName} />
                <Row label="Trainer" value={response.certificate.trainerName} />
                <Row label="Organization" value={response.certificate.organizationName} />
                <Row label="Certificate ID" value={response.certificate.certificateId} />
                <Row label="Serial Number" value={response.certificate.serialNumber} />
                <Row label="Completion Date" value={formatDate(response.certificate.completionDate)} />
                <Row label="Issue Date" value={formatDate(response.certificate.issueDate)} />
                {response.certificate.grade && <Row label="Grade" value={response.certificate.grade} />}
                {response.certificate.scorePercentage != null && (
                  <Row label="Score" value={`${response.certificate.scorePercentage.toFixed(1)}%`} />
                )}
                <Row label="Times Verified" value={String(response.certificate.verificationCount)} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
    <span className="text-slate-400 font-bold">{label}</span>
    <span className="font-extrabold text-slate-800">{value}</span>
  </div>
);

export default VerifyCertificate;
