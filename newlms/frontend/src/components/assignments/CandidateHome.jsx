import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Play, ClipboardList, AlertCircle } from 'lucide-react';

export const CandidateHome = ({ onStartExam, onViewResult }) => {
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [completedAttempts, setCompletedAttempts] = useState([]);
  const [assignedTests, setAssignedTests] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchExamStatus();
  }, []);

  const fetchExamStatus = async () => {
    try {
      const response = await apiClient.get('/api/candidate/exam-status');
      setActiveAttempt(response.data.activeAttempt);
      setCompletedAttempts(response.data.completedAttempts || []);
      setAssignedTests(response.data.assignedTests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (testId) => {
    setActionLoading(testId);
    try {
      const response = await apiClient.post('/api/candidate/exam/start', { testId });
      const { attemptId } = response.data;
      onStartExam(attemptId);
    } catch (err) {
      console.error(err);
      alert('Failed to start exam. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-slate-400 text-sm font-semibold">Checking exam status...</p>
        </div>
      </div>
    );
  }

  // Filter out assigned tests that have been completed or are in progress
  const availableTests = assignedTests.filter(t => 
    !completedAttempts.find(c => c.testId === t.id) &&
    activeAttempt?.testId !== t.id
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 text-left">
      {/* Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-6">
            <ClipboardList className="h-8 w-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-800">Technical Assessment Portal</h2>
          <p className="text-slate-500 text-xs mt-2 max-w-md">
            This module evaluates your core technical proficiency. Please ensure you have a stable connection and a working webcam.
          </p>
        </div>
      </div>

      {activeAttempt && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-indigo-800">
            <AlertCircle className="h-6 w-6 text-indigo-600 flex-shrink-0" />
            <h3 className="font-bold text-sm">In Progress: {activeAttempt.title}</h3>
          </div>
          <p className="text-xs text-indigo-700/80">You have an ongoing exam session in progress.</p>
          <button
            onClick={() => onStartExam(activeAttempt.id)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-8 py-3 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
          >
            Resume Assessment
          </button>
        </div>
      )}

      {availableTests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Available Assessments</h3>
          <div className="grid gap-4">
            {availableTests.map(test => (
              <div key={test.id} className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-bold text-slate-800 text-md">{test.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{test.description}</p>
                  
                  <div className="mt-3 text-[10px] text-slate-400 space-y-1">
                    <p className="flex items-center gap-1 font-bold uppercase"><AlertCircle className="w-3 h-3 text-amber-500"/> Proctored: Webcam, Screen Activity, Tab switching are monitored.</p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartExam(test.id)}
                  disabled={actionLoading === test.id}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {actionLoading === test.id ? 'Starting...' : <><Play className="h-4 w-4 fill-white text-white" /> Start Exam</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedAttempts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Completed Assessments</h3>
          <div className="grid gap-4">
            {completedAttempts.map(attempt => (
              <div key={attempt.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">{attempt.title || 'Technical Assessment'}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-md font-black text-slate-800">{attempt.result?.percentage}%</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${attempt.result?.passFail === 'PASS' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                      {attempt.result?.passFail}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onViewResult}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer bg-white"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {availableTests.length === 0 && !activeAttempt && completedAttempts.length === 0 && (
        <div className="text-center text-slate-400 py-10 font-bold text-xs">
          No tests currently assigned.
        </div>
      )}
    </div>
  );
};

export default CandidateHome;
