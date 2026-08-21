import React from 'react';
import { motion } from 'framer-motion';
import { Users, Hourglass, CheckCircle2, TrendingUp, PlayCircle, BarChart3, PieChart } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';

const Analytics = () => {
  const stats = [
    { title: 'Total Students', value: '1,482', icon: Users, change: '+12% this month', color: 'bg-brand-50 text-brand-600 border-brand-100/50' },
    { title: 'Active Students', value: '894', icon: TrendingUp, change: '+8% this week', color: 'bg-emerald-50 text-emerald-600 border-emerald-100/50' },
    { title: 'Course Completion', value: '78.5%', icon: CheckCircle2, change: '+2.3% vs last quarter', color: 'bg-blue-50 text-blue-600 border-blue-100/50' },
    { title: 'Avg Watch Time', value: '45 mins/day', icon: Hourglass, change: '+15% from last month', color: 'bg-amber-50 text-amber-600 border-amber-100/50' },
    { title: 'Engagement Rate', value: '92.4%', icon: PlayCircle, change: '+1.2% this week', color: 'bg-rose-50 text-rose-600 border-rose-100/50' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col text-left mb-8"
    >
      <PageHeader
        title="Analytics & Performance Metrics"
        subtitle="Track student registrations, watch time averages, lesson success rates, and engagement."
      />

      {/* Header Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((st, i) => (
          <Card key={i} className="p-4 flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{st.title}</span>
                <span className="text-xl font-extrabold text-slate-800 tracking-tight">{st.value}</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${st.color}`}>
                <st.icon size={16} />
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600">{st.change}</span>
          </Card>
        ))}
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Student Growth Chart (Line Area) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><TrendingUp size={14} className="text-cyan-500" /> Student Growth (Weekly)</h3>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50 border px-2 py-0.5 rounded-lg">Live updates</span>
          </div>

          <div className="h-44 w-full relative pt-2 select-none">
            <svg viewBox="0 0 100 35" className="w-full h-full text-cyan-500">
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(6, 182, 212, 0.15)" />
                  <stop offset="100%" stopColor="rgba(6, 182, 212, 0.0)" />
                </linearGradient>
              </defs>
              <line x1="0" y1="9" x2="100" y2="9" stroke="#f8fafc" strokeWidth="0.2" />
              <line x1="0" y1="18" x2="100" y2="18" stroke="#f8fafc" strokeWidth="0.2" />
              <line x1="0" y1="27" x2="100" y2="27" stroke="#f8fafc" strokeWidth="0.2" />
              
              <path d="M 0 35 Q 12 30 25 22 T 50 12 T 75 16 T 100 4 L 100 35 Z" fill="url(#growthGrad)" />
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2 }}
                d="M 0 35 Q 12 30 25 22 T 50 12 T 75 16 T 100 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.75"
              />
              <circle cx="100" cy="4" r="1.2" fill="#06b6d4" stroke="#fff" strokeWidth="0.4" />
            </svg>
            <div className="absolute top-2 right-4 bg-slate-900 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow">
              Now: +1,482 members
            </div>
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider pt-2 border-t border-slate-50">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>

        {/* Daily Active Users (DAU, Bar Chart) */}
        <div className="bg-white border border-slate-100 p-5 rounded-[20px] shadow-premium flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><BarChart3 size={14} className="text-cyan-500" /> Daily Active Users</h3>
            <span className="text-[9px] text-slate-400 font-bold">Mon-Sun</span>
          </div>

          <div className="h-44 flex items-end justify-between px-2 pt-4 select-none">
            {[45, 60, 75, 50, 85, 90, 65].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-7">
                <div className="w-full bg-slate-50 h-32 rounded-lg flex items-end overflow-hidden">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className="w-full bg-cyan-500 rounded-b-lg"
                  />
                </div>
                <span className="text-[9px] text-slate-400 font-bold uppercase">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Popularity (Horizontal Bar Chart) */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Course Popularity</h3>
          
          <div className="flex flex-col gap-4 py-2">
            {[
              { name: 'React Masterclass', count: '640 Students', pct: '85%', color: 'bg-brand-500' },
              { name: 'Python Basics Zero to Hero', count: '482 Students', pct: '64%', color: 'bg-blue-500' },
              { name: 'AWS Cloud Fundamentals', count: '280 Students', pct: '38%', color: 'bg-amber-500' },
              { name: 'Node.js Essentials', count: '120 Students', pct: '18%', color: 'bg-rose-500' }
            ].map((course, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>{course.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{course.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: course.pct }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={`h-full rounded-full ${course.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Watch Time Distribution (Area Line Graph) */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Watch Time Distribution</h3>

          <div className="h-40 w-full relative pt-2">
            <svg viewBox="0 0 100 40" className="w-full h-full text-emerald-500">
              <defs>
                <linearGradient id="watchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.15)" />
                  <stop offset="100%" stopColor="rgba(16, 185, 129, 0.0)" />
                </linearGradient>
              </defs>
              <path d="M 0 38 Q 20 28 40 12 T 80 25 T 100 15 L 100 40 L 0 40 Z" fill="url(#watchGrad)" />
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2 }}
                d="M 0 38 Q 20 28 40 12 T 80 25 T 100 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.85"
              />
            </svg>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase border-t border-slate-50 pt-2.5">
            <span>Beginner</span>
            <span>Intermediate</span>
            <span>Advanced</span>
          </div>
        </div>

        {/* Lesson Completion Rate (Pie ring) */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex flex-col justify-between gap-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lesson Completion Rate</h3>
          
          <div className="flex items-center justify-center relative py-2">
            <svg width="110" height="110" viewBox="0 0 40 40" className="transform -rotate-90">
              <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
              <motion.circle
                initial={{ strokeDasharray: '0 100' }}
                animate={{ strokeDasharray: '78 22' }}
                transition={{ duration: 1 }}
                cx="20"
                cy="20"
                r="15.915"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="4"
                strokeDashoffset="0"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-black text-slate-800">78.5%</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Rate</span>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-slate-500 text-center leading-relaxed max-w-xs mx-auto">
            78.5% of students complete the coding assignments within 7 days of lesson views.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
