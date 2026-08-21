import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Award, Megaphone, Bell, Sparkles, ChevronDown } from 'lucide-react';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import VoiceAssignmentStudent from '../../components/assignments/VoiceAssignmentStudent';
import CandidateHome from '../../components/assignments/CandidateHome';
import axios from 'axios';

// 1. Assignments Component
export const StudentAssignments = () => {
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
          console.log('Attempting automatic sign-in for candidate...');
          const response = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'candidate@test.com',
            password: 'password'
          });
          const { token: fetchedToken, user } = response.data;
          
          localStorage.setItem('token', fetchedToken);
          localStorage.setItem('lms_candidate_token', fetchedToken);
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 text-left"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Assignments Portal" subtitle="Submit your project solutions, view tutor grading logs, and track task checksheets." />
        
        {/* Assignment Type Selector Dropdown */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto">
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
      
      {assignmentType === 'Normal Assignment' ? (
        authLoading ? (
          <div className="flex h-64 items-center justify-center bg-white border border-slate-100 rounded-3xl min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent"></div>
              <p className="text-slate-450 text-sm font-semibold">Autologging in candidate...</p>
            </div>
          </div>
        ) : authError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center max-w-md mx-auto min-h-[50vh] flex flex-col justify-center items-center">
            <p className="text-sm text-rose-700 font-bold">{authError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-750 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : isAuthed ? (
          <CandidateHome />
        ) : null
      ) : (
        <VoiceAssignmentStudent />
      )}
    </motion.div>
  );
};

// 2. Certificates Component Placeholder
export const StudentCertificates = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 text-left"
    >
      <PageHeader title="My Certificates" subtitle="View and share verification certificates for your completed course curricula." />
      
      <Card className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-300 bg-white min-h-[50vh]">
        <div className="p-4 bg-amber-50 rounded-full text-amber-600 mb-4 animate-bounce">
          <Award size={36} />
        </div>
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Earn Verification Badges</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
          Certificates will automatically appear here once you finish 100% of all lessons in an enrolled course pathway. Keep up the streak!
        </p>
      </Card>
    </motion.div>
  );
};

// 3. Announcements Component Placeholder
export const StudentAnnouncements = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 text-left"
    >
      <PageHeader title="Course Bulletins" subtitle="Stay updated with course announcements, calendar adjustments, and session schedules." />
      
      <Card className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-300 bg-white min-h-[50vh]">
        <div className="p-4 bg-pink-50 rounded-full text-pink-600 mb-4">
          <Megaphone size={36} />
        </div>
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight">No announcements yet</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
          Any announcements sent by tutor Manoj for your enrolled courses will appear here on your notice board.
        </p>
      </Card>
    </motion.div>
  );
};

// 4. Notifications Component Placeholder
export const StudentNotifications = () => {
  const dummyNotifs = [
    { id: 1, title: 'New Lesson Uploaded', body: 'Tutor Manoj uploaded Advanced Context Hooks to Advanced React course.', time: '2 hours ago', unread: true },
    { id: 2, title: 'Upcoming Live Webinar', body: 'Q&A coding checkpoint starts tomorrow at 4 PM.', time: '1 day ago', unread: false },
    { id: 3, title: 'LMS Account Initialized', body: 'Welcome to the Student Hub. Start editing your learning goals in Profile.', time: '2 days ago', unread: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 text-left"
    >
      <PageHeader title="Notifications" subtitle="Track live progress alerts, lecture schedules, and new course publications." />
      
      <div className="flex flex-col gap-3">
        {dummyNotifs.map(n => (
          <Card 
            key={n.id} 
            className={`p-4 flex items-start gap-4 bg-white border-slate-200/50 shadow-sm text-left
              ${n.unread ? 'border-l-4 border-l-indigo-600' : ''}`}
          >
            <div className={`p-2 rounded-xl flex-shrink-0 
              ${n.unread ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}
            >
              <Bell size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-extrabold text-slate-800">{n.title}</h4>
                {n.unread && (
                  <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full uppercase">New</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{n.body}</p>
              <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">{n.time}</span>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};
