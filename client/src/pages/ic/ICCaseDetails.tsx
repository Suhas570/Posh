import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { StatusBadge, Skeleton } from '../../components/common/UI';
import { ShieldAlert, History, Plus, Users, Award, BookOpen, UserMinus } from 'lucide-react';

const ICCaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'witness'>('details');

  // Modals status
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { register: witnessReg, handleSubmit: witnessSubmit, reset: witnessReset } = useForm();
  const { register: closeReg, handleSubmit: closeSubmit } = useForm();
  const { register: rejectReg, handleSubmit: rejectSubmit } = useForm();

  // Notes form bindings
  const [observations, setObservations] = useState('');
  const [evidenceSummary, setEvidenceSummary] = useState('');
  const [progress, setProgress] = useState('');
  const [notesRemarks, setNotesRemarks] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);

  const fetchCaseDetails = async () => {
    try {
      const res = await api.get(`/ic/cases/${id}`);
      if (res.data.success) {
        setData(res.data.data);
        const notes = res.data.data.investigationNotes;
        if (notes) {
          setObservations(notes.observations || '');
          setEvidenceSummary(notes.evidenceSummary || '');
          setProgress(notes.progress || '');
          setNotesRemarks(notes.remarks || '');
        }
      }
    } catch (error) {
      showToast('Failed to load case file details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  const handleStartInvestigation = async () => {
    setActionLoading(true);
    try {
      const res = await api.put(`/ic/cases/${id}/start-investigation`);
      if (res.data.success) {
        showToast('Investigation status initiated!', 'success');
        fetchCaseDetails();
      }
    } catch (error) {
      showToast('Failed to start investigation', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setNotesSaving(true);
    try {
      const res = await api.put(`/ic/cases/${id}/notes`, {
        observations,
        evidenceSummary,
        progress,
        remarks: notesRemarks
      });
      if (res.data.success) {
        showToast('Investigation notes updated successfully!', 'success');
        fetchCaseDetails();
      }
    } catch (error) {
      showToast('Failed to save notes', 'error');
    } finally {
      setNotesSaving(false);
    }
  };

  const handleAddWitness = async (witnessData: any) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/ic/cases/${id}/witness`, witnessData);
      if (res.data.success) {
        showToast('Witness testimony recorded successfully!', 'success');
        witnessReset();
        setShowWitnessModal(false);
        fetchCaseDetails();
      }
    } catch (error) {
      showToast('Failed to record witness statement', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseCase = async (closeData: any) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/ic/cases/${id}/close`, closeData);
      if (res.data.success) {
        showToast('Case closed successfully. Official records filed.', 'success');
        setShowCloseModal(false);
        fetchCaseDetails();
      }
    } catch (error) {
      showToast('Failed to close case', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCase = async (rejectData: any) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/ic/cases/${id}/reject`, rejectData);
      if (res.data.success) {
        showToast('Case rejected and recorded.', 'success');
        setShowRejectModal(false);
        fetchCaseDetails();
      }
    } catch (error) {
      showToast('Failed to reject case', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Skeleton className="h-64" />;
  if (!data || !data.case) return <div className="text-center py-8">Case record missing</div>;

  const { case: caseObj, investigationNotes: notesObj } = data;

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div>
          <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 block">{caseObj.complaintId}</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{caseObj.complaintType}</h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={caseObj.status} />
          {caseObj.status === 'New' && (
            <button
              onClick={handleStartInvestigation}
              disabled={actionLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
            >
              Start Investigation
            </button>
          )}
          {caseObj.status !== 'Closed' && caseObj.status !== 'Rejected' && (
            <>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                Reject Case
              </button>
              <button
                onClick={() => setShowCloseModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                Close Case
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700/50">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-6 py-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'details'
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Case File
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-6 py-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          IC Investigation Notes (Private)
        </button>
        <button
          onClick={() => setActiveTab('witness')}
          className={`px-6 py-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'witness'
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Witness statements ({notesObj?.witnessStatements?.length || 0})
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        
        {/* CASE FILE DETAILS */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Complainant & Accused details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/25 p-5 rounded-xl border border-gray-100 dark:border-gray-700/30">
                <h3 className="font-bold text-sm text-gray-800 dark:text-white mb-3">Complainant (Victim) Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 block font-semibold">Name (Victim):</span>
                    <span className="font-bold text-gray-800 dark:text-white">
                      {caseObj.complainant ? `${caseObj.complainant.firstName} ${caseObj.complainant.lastName}` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Employee ID:</span>
                    <span className="font-bold text-gray-800 dark:text-white">{caseObj.complainant?.employeeId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Department:</span>
                    <span className="font-bold text-gray-800 dark:text-white">{caseObj.complainant?.department?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Contact:</span>
                    <span className="font-bold text-gray-800 dark:text-white">{caseObj.complainant?.phone || 'N/A'}</span>
                  </div>
                </div>
                {caseObj.isAnonymous && (
                  <div className="mt-4 p-3.5 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-xl font-bold border border-amber-200/10 text-[10px]">
                    ANONYMOUS FILING: Filed anonymously. Complainant/Victim identity is visible to IC committee members, but scrubbed from the general administrative dashboard.
                  </div>
                )}
              </div>

              {/* Accused & Incident summary */}
              <div className="bg-gray-50 dark:bg-gray-700/25 p-5 rounded-xl border border-gray-100 dark:border-gray-700/30">
                <h3 className="font-bold text-sm text-gray-800 dark:text-white mb-3">Accused & Incident Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-gray-400 block font-semibold">Accused Person:</span>
                    <span className="font-bold text-gray-800 dark:text-white">{caseObj.accusedPerson}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Incident location:</span>
                    <span className="font-bold text-gray-800 dark:text-white">{caseObj.incidentLocation}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Date of Incident:</span>
                    <span className="font-bold text-gray-800 dark:text-white">
                      {new Date(caseObj.incidentDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Time of Incident:</span>
                    <span className="font-bold text-gray-800 dark:text-white">{caseObj.incidentTime}</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700/20 pt-3">
                  <span className="text-gray-400 block font-semibold mb-1">Details:</span>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">"{caseObj.description}"</p>
                </div>
              </div>

              {/* Evidence details */}
              {caseObj.evidence && (
                <div className="bg-gray-50 dark:bg-gray-700/25 p-5 rounded-xl border border-gray-100 dark:border-gray-700/30">
                  <h3 className="font-bold text-sm text-gray-800 dark:text-white mb-2">Evidence Attachment</h3>
                  <a
                    href={`/${caseObj.evidence}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg font-bold hover:bg-gray-50 text-indigo-600 dark:text-indigo-400"
                  >
                    View File Attachment
                  </a>
                </div>
              )}
            </div>

            {/* Case timeline details */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-1.5 mb-2">
                <History size={16} className="text-indigo-600" />
                Case History
              </h3>
              
              <div className="border-l border-gray-200 dark:border-gray-700 ml-2 pl-4 space-y-4">
                {caseObj.timeline && caseObj.timeline.map((entry: any, index: number) => (
                  <div key={index} className="relative">
                    <span className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full border-2 border-indigo-600 bg-white dark:bg-gray-800"></span>
                    <div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-bold"><StatusBadge status={entry.status} /></span>
                        <span className="text-[10px] text-gray-400 font-bold">{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">{entry.remarks} (updated by {entry.updatedBy})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* IC INVESTIGATION NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/20 text-amber-800 dark:text-amber-300 font-bold">
              Confidential Warning: These notes are strictly private. Admins, Super Admins, and employees have no access.
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Observations & Context</label>
                <textarea
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Record initial committee review observations here..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Evidence Summary</label>
                <textarea
                  rows={3}
                  value={evidenceSummary}
                  onChange={(e) => setEvidenceSummary(e.target.value)}
                  placeholder="Compile screenshots, messages, and uploaded assets..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Investigation Progress Log</label>
                <textarea
                  rows={3}
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  placeholder="Log details of interviews, queries, and audit requests..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Internal Remarks</label>
                <textarea
                  rows={3}
                  value={notesRemarks}
                  onChange={(e) => setNotesRemarks(e.target.value)}
                  placeholder="Any miscellaneous remarks for the committee..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 dark:border-gray-700/50 pt-4">
              <button
                onClick={handleSaveNotes}
                disabled={notesSaving}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
              >
                {notesSaving ? 'Saving Notes...' : 'Save Notes'}
              </button>
            </div>
          </div>
        )}

        {/* WITNESS STATEMENTS */}
        {activeTab === 'witness' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-1.5">
                <Users size={18} className="text-indigo-600" />
                Witness Testimonies Log
              </h3>
              {caseObj.status !== 'Closed' && caseObj.status !== 'Rejected' && (
                <button
                  onClick={() => setShowWitnessModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  Add Witness
                </button>
              )}
            </div>

            <div className="space-y-4">
              {notesObj?.witnessStatements && notesObj.witnessStatements.length > 0 ? (
                notesObj.witnessStatements.map((ws: any) => (
                  <div key={ws._id} className="p-4 bg-gray-50 dark:bg-gray-700/25 border border-gray-100 dark:border-gray-700/30 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <strong className="text-gray-800 dark:text-white font-bold">{ws.witnessName}</strong>
                      <span className="text-[10px] text-gray-400 font-bold">{new Date(ws.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 italic bg-white dark:bg-gray-900/40 p-3 rounded-lg border border-gray-100 dark:border-gray-700/10">
                      "{ws.statement}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 font-medium">
                  No witness statements recorded.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ADD WITNESS STATEMENT MODAL */}
      {showWitnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
              <span className="font-bold text-sm text-gray-800 dark:text-white">Record Witness Statement</span>
              <button onClick={() => setShowWitnessModal(false)} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            
            <form onSubmit={witnessSubmit(handleAddWitness)} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Witness Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  {...witnessReg('witnessName', { required: true })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Testimony Statement</label>
                <textarea
                  rows={4}
                  placeholder="Type the statement as narrated by the witness..."
                  {...witnessReg('statement', { required: true })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => setShowWitnessModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Record Statement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOSE CASE MODAL */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
              <span className="font-bold text-sm text-gray-800 dark:text-white">Close POSH Complaint</span>
              <button onClick={() => setShowCloseModal(false)} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            
            <form onSubmit={closeSubmit(handleCloseCase)} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Investigation Outcome</label>
                <select
                  {...closeReg('outcome', { required: true })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none text-gray-950 dark:text-white"
                >
                  <option value="Complaint Substantiated">Complaint Substantiated</option>
                  <option value="Complaint Not Substantiated">Complaint Not Substantiated</option>
                  <option value="Insufficient Evidence">Insufficient Evidence</option>
                  <option value="False Complaint">False Complaint</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Closure remarks / Findings Summary</label>
                <textarea
                  rows={3}
                  {...closeReg('closingRemarks', { required: true })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Recommendations (for HR/Action)</label>
                <textarea
                  rows={3}
                  {...closeReg('recommendation', { required: true })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Close Case File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT CASE MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
              <span className="font-bold text-sm text-gray-800 dark:text-white">Reject POSH Case</span>
              <button onClick={() => setShowRejectModal(false)} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            
            <form onSubmit={rejectSubmit(handleRejectCase)} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Reason for Rejection</label>
                <textarea
                  rows={4}
                  {...rejectReg('closingRemarks', { required: true })}
                  placeholder="State the reason (e.g. false claim, unrelated to POSH scope, insufficient basic information)"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Reject Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ICCaseDetails;
