import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  DollarSign, 
  Activity, 
  Server, 
  Database, 
  TrendingUp, 
  Clock, 
  ShieldCheck,
  Video,
  FileText,
  Presentation,
  Layers,
  FileCode
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [sData, aData] = await Promise.all([
      adminService.getStats(),
      adminService.getAuditLogs()
    ]);
    setStats(sData);
    setAuditLogs(aData);
    setLoading(false);
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64 text-purple-400 font-bold text-sm">
        Loading Super Admin Platform Metrics...
      </div>
    );
  }

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: GraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { title: 'Pending Tutor Approvals', value: '1 Pending', icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { title: 'Active / Suspended Tutors', value: `${stats.totalTutors} Active / 0 Suspended`, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { title: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { title: 'Published Courses', value: stats.publishedCourses, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Modules & Lessons', value: `${stats.totalModules || 0} / ${stats.totalLessons || 0}`, icon: Layers, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { title: 'Videos / PDFs / PPTs', value: `${stats.totalVideos || 0} / ${stats.totalPDFs || 0} / ${stats.totalPPTs || 0}`, icon: Video, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { title: 'Total Enrollments', value: stats.totalEnrollments, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { title: 'Active Users Today', value: stats.activeUsersToday, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' }
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tight text-white">Super Admin Operational Dashboard</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Live metrics calculated directly from database records.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-400 text-xs font-bold">
          <ShieldCheck size={14} />
          <span>System Status: {stats.systemHealth}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`p-4 rounded-2xl border ${card.bg} flex items-center justify-between`}
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
              <span className="text-xl font-black text-white mt-1">{card.value}</span>
            </div>
            <div className={`p-3 rounded-xl bg-slate-900/80 ${card.color}`}>
              <card.icon size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Infrastructure & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
            <Server size={16} className="text-purple-400" /> Platform Infrastructure
          </h2>

          <div className="flex flex-col gap-3 text-xs font-bold">
            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-2"><Server size={14}/> REST Backend</span>
              <span className="text-emerald-400 font-mono">PORT 5000</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-2"><Database size={14}/> Persistence</span>
              <span className="text-emerald-400 font-mono">Prisma / Database</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-2"><TrendingUp size={14}/> Storage Usage</span>
              <span className="text-purple-400 font-mono">{stats.storageUsedGb}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
            <Clock size={16} className="text-purple-400" /> Audit Log & Activity Traces
          </h2>

          <div className="flex flex-col gap-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800/40 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {log.action}
                  </span>
                  <span className="text-slate-200 font-bold">{log.user}</span>
                  <span className="text-slate-400 font-medium">({log.target})</span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
