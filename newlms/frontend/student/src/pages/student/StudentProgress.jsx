import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, BookOpen, CheckSquare, Award } from 'lucide-react';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/dashboard/StatsCard';

const StudentProgress = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 text-left"
    >
      <PageHeader 
        title="Student Learning Progress" 
        subtitle="Review your completed lessons, study duration stats, weekly hours, and course pathways."
      />

      {/* Grid of stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Overall Completion" 
          value="68%" 
          icon={TrendingUp} 
          trendText="+12% progress this month" 
          colorClass="brand"
        />
        <StatsCard 
          title="Learning Hours" 
          value="34.2 hrs" 
          icon={Clock} 
          trendText="3.1 hrs daily average" 
          colorClass="blue"
        />
        <StatsCard 
          title="Completed Lessons" 
          value="18 Lessons" 
          icon={CheckSquare} 
          trendText="+4 checked today" 
          colorClass="green"
        />
        <StatsCard 
          title="Certificates Claimed" 
          value="2 Badges" 
          icon={Award} 
          trendText="Next badge at 100%" 
          colorClass="purple"
        />
      </div>

      {/* Grid containing Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Activity Area Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/50 p-5 rounded-[20px] shadow-sm flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-indigo-500" /> Weekly Learning Activity (Hours)
            </h3>
            <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 border px-2 py-0.5 rounded-lg">Mock data</span>
          </div>

          <div className="h-44 w-full relative pt-2 select-none">
            <svg viewBox="0 0 100 35" className="w-full h-full text-indigo-500">
              <defs>
                <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(79, 70, 229, 0.15)" />
                  <stop offset="100%" stopColor="rgba(79, 70, 229, 0.0)" />
                </linearGradient>
              </defs>
              <line x1="0" y1="9" x2="100" y2="9" stroke="#f8fafc" strokeWidth="0.2" />
              <line x1="0" y1="18" x2="100" y2="18" stroke="#f8fafc" strokeWidth="0.2" />
              <line x1="0" y1="27" x2="100" y2="27" stroke="#f8fafc" strokeWidth="0.2" />
              
              <path d="M 0 35 Q 15 28 30 24 T 60 14 T 80 18 T 100 8 L 100 35 Z" fill="url(#progressGrad)" />
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2 }}
                d="M 0 35 Q 15 28 30 24 T 60 14 T 80 18 T 100 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.75"
              />
              <circle cx="100" cy="8" r="1.2" fill="#4f46e5" stroke="#fff" strokeWidth="0.4" />
            </svg>
          </div>

          <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider pt-2 border-t border-slate-50">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Course Milestones (1 Column) */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest px-1">Enrolled Milestones</h3>
          
          <div className="flex flex-col gap-3">
            <Card className="p-4 bg-white border-slate-200/50 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Advanced React Hooks</span>
                <span className="text-indigo-600">80%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '80%' }} />
              </div>
            </Card>

            <Card className="p-4 bg-white border-slate-200/50 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Tailwind CSS Architecture</span>
                <span className="text-indigo-600">45%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '45%' }} />
              </div>
            </Card>
          </div>
        </div>

      </div>

    </motion.div>
  );
};

export default StudentProgress;
