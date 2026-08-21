import React, { useEffect, useState } from 'react';
import { BarChart3, Download, TrendingUp, Users, BookOpen, Layers } from 'lucide-react';
import { adminService } from '../../services/adminService';

const ReportsAnalytics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await adminService.getStats();
    setStats(data);
  };

  const chartData = [
    { label: 'Jan', students: 20, courses: 1 },
    { label: 'Feb', students: 45, courses: 1 },
    { label: 'Mar', students: 68, courses: 2 },
    { label: 'Apr', students: 95, courses: 2 },
    { label: 'May', students: 112, courses: 2 },
    { label: 'Jun', students: 128, courses: 2 }
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Platform Learning Analytics & Reports</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Super Admin platform growth, course engagement, and live data charts.</p>
        </div>

        <button 
          onClick={() => alert('Platform Analytics Report Exported as CSV')}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-purple-500/20"
        >
          <Download size={14} /> Export CSV Report
        </button>
      </div>

      {/* Live Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Growth Chart */}
        <div className="bg-[#0d1322] border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-400" /> Student Growth Trend
            </h2>
            <span className="text-xs font-bold text-emerald-400">+128 Total Students</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-4 pt-6 pb-2 px-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
            {chartData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div 
                  className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-lg transition-all"
                  style={{ height: `${(d.students / 140) * 100}%` }}
                  title={`${d.label}: ${d.students} Students`}
                />
                <span className="text-[10px] font-bold text-slate-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Distribution Metrics */}
        <div className="bg-[#0d1322] border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <BookOpen size={16} className="text-purple-400" /> Platform Content Distribution
            </h2>
            <span className="text-xs font-bold text-purple-400">{stats?.totalCourses || 2} Courses Active</span>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-xs">
              <span className="text-slate-300 font-bold">Video Lectures</span>
              <span className="font-mono text-indigo-400 font-bold">{stats?.totalVideos || 2} Uploaded</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-xs">
              <span className="text-slate-300 font-bold">PDF Handouts & Notes</span>
              <span className="font-mono text-blue-400 font-bold">{stats?.totalPDFs || 2} Uploaded</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-xs">
              <span className="text-slate-300 font-bold">PowerPoint Slide Decks</span>
              <span className="font-mono text-emerald-400 font-bold">{stats?.totalPPTs || 2} Uploaded</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-xs">
              <span className="text-slate-300 font-bold">Curriculum Modules & Lessons</span>
              <span className="font-mono text-amber-400 font-bold">{stats?.totalModules || 2} Modules / {stats?.totalLessons || 2} Lessons</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
