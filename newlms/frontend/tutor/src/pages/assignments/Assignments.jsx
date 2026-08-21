import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import VoiceAssignmentTutor from '../../components/assignments/VoiceAssignmentTutor';
import HRDashboard from '../../components/assignments/HRDashboard';
import axios from 'axios';

const Assignments = () => {
  const [assignmentType, setAssignmentType] = useState('Voice Assistance Assignment');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    if (assignmentType === 'Normal Assignment') {
      const performAutoLogin = async () => {
        
        setAuthLoading(true);
        setAuthError(null);
        try {
          console.log('Attempting automatic sign-in for tutor (HR)...');
          const response = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'hr@test.com',
            password: 'password'
          });
          const { token: fetchedToken, user } = response.data;
          
          localStorage.setItem('token', fetchedToken);
          localStorage.setItem('user', JSON.stringify(user));
          setIsAuthed(true);
        } catch (err) {
          console.error('Auto sign-in failed', err);
          setAuthError('Auto sign-in failed. Please ensure the backend server is running.');
        } finally {
          setAuthLoading(false);
        }
      };
      performAutoLogin();
    }
  }, [assignmentType]);

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

      <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-premium mt-1">
        {assignmentType === 'Normal Assignment' ? (
          authLoading ? (
            <div className="flex h-64 items-center justify-center min-h-[40vh]">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent"></div>
                <p className="text-slate-450 text-sm font-semibold">Autologging in Tutor (HR) Portal...</p>
              </div>
            </div>
          ) : authError ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center max-w-md mx-auto min-h-[40vh] flex flex-col justify-center items-center">
              <p className="text-sm text-rose-700 font-bold">{authError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-rose-650 text-white rounded-xl text-xs font-bold hover:bg-rose-750 cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          ) : isAuthed ? (
            <HRDashboard />
          ) : null
        ) : (
          <VoiceAssignmentTutor />
        )}
      </div>
    </motion.div>
  );
};

export default Assignments;
