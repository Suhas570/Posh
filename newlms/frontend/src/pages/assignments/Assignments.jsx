import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, FileText, ChevronDown, ListPlus, Award } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import VoiceAssignmentTutor from '../../components/assignments/VoiceAssignmentTutor';
import HRDashboard from '../../components/assignments/HRDashboard';
import HRResults from '../../components/assignments/HRResults';
import HRResultDetail from '../../components/assignments/HRResultDetail';
import axios from 'axios';

const Assignments = () => {
  const [assignmentType, setAssignmentType] = useState('Voice Assistance Assignment');
  
  // Normal Assignment Sub-views: 'CREATOR' | 'RESULTS' | 'DETAIL'
  const [subView, setSubView] = useState('CREATOR');
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  // Auto sign-in HR user silently if no token exists
  useEffect(() => {
    const authenticateHR = async () => {
      const token = localStorage.getItem('assessment_tutor_token');
      if (token) {
        setAuthenticated(true);
        return;
      }
      try {
        const response = await axios.post('http://localhost:5001/api/auth/login', {
          email: 'hr@test.com',
          password: 'password'
        });
        localStorage.setItem('assessment_tutor_token', response.data.token);
        localStorage.setItem('assessment_tutor_user', JSON.stringify(response.data.user));
        setAuthenticated(true);
      } catch (e) {
        console.error('Failed to auto authenticate HR:', e);
      }
    };
    authenticateHR();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col text-left gap-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Assignments Hub"
          subtitle="Manage student exercises, project submissions, and evaluation metrics."
        />

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Subview Selector for Normal Assignment */}
          {assignmentType === 'Normal Assignment' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => { setSubView('CREATOR'); setSelectedAttemptId(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subView === 'CREATOR'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ListPlus size={14} /> Creator Dashboard
              </button>
              <button
                onClick={() => { setSubView('RESULTS'); setSelectedAttemptId(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subView === 'RESULTS' || subView === 'DETAIL'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Award size={14} /> Student Results
              </button>
            </div>
          )}

          {/* Assignment Type Selector Dropdown */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <label className="text-xs font-bold text-slate-500 pl-2 uppercase tracking-wider">
              Assignment Type:
            </label>
            <div className="relative">
              <select
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value)}
                className="appearance-none bg-slate-50 text-slate-800 text-xs font-bold py-2 pl-3 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                <option value="Normal Assignment">Normal Assignment</option>
                <option value="Voice Assistance Assignment">Voice Assistance Assignment</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-premium mt-1">
        {assignmentType === 'Normal Assignment' ? (
          !authenticated ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                <p className="text-slate-400 text-sm font-semibold">Authenticating Session...</p>
              </div>
            </div>
          ) : (
            <div>
              {subView === 'CREATOR' && <HRDashboard />}
              {subView === 'RESULTS' && (
                <HRResults
                  onViewDetail={(attemptId) => {
                    setSelectedAttemptId(attemptId);
                    setSubView('DETAIL');
                  }}
                />
              )}
              {subView === 'DETAIL' && (
                <HRResultDetail
                  attemptId={selectedAttemptId}
                  onBack={() => setSubView('RESULTS')}
                />
              )}
            </div>
          )
        ) : (
          <VoiceAssignmentTutor />
        )}
      </div>
    </motion.div>
  );
};

export default Assignments;
