import React, { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { Skeleton, FadeInPage, PremiumButton, StatusBadge } from '../../components/common/UI';
import { Users, Building, FileText, ClipboardList, ShieldAlert, ArrowRight, Activity, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const { showToast } = useNotification();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        showToast('Failed to load admin dashboard summary', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Skeleton className="h-64" />;

  const { stats, leaveApprovals } = data || {};

  return (
    <FadeInPage className="space-y-6 text-xs font-sans">
      
      {/* 1. ADMIN STRATEGIC HERO CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl border border-indigo-900/50 shadow-xl flex flex-col justify-between relative overflow-hidden group">
        
        {/* Animated background lights */}
        <motion.span
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full select-none pointer-events-none"
        ></motion.span>
        
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-full text-[9px] font-black tracking-widest uppercase select-none border border-white/5">
            <Activity size={10} className="text-indigo-400 animate-pulse" /> Administrative Console
          </span>
          <h2 className="text-3xl font-black text-white mt-5 tracking-tight leading-tight">
            Administrator Command Dashboard
          </h2>
          <p className="text-slate-350 font-bold leading-relaxed mt-2.5 text-xs max-w-2xl">
            Access your company metrics dashboard. Manage the employee registry, process payroll registers, approve leave applications, and track POSH compliance.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-8 relative z-10">
          <Link to="/admin/employees">
            <PremiumButton variant="primary" className="py-2.5 px-5 cursor-pointer">
              Manage Employees <ArrowRight size={14} />
            </PremiumButton>
          </Link>
          <Link to="/admin/payroll">
            <PremiumButton variant="secondary" className="py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white border border-white/10">
              <FileText size={14} /> Process Salaries
            </PremiumButton>
          </Link>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* Card 1: Total Employees */}
        <motion.div
          whileHover={{ y: -6 }}
          className="bg-slate-900 dark:bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center relative z-10">
            <span className="text-amber-500 font-black tracking-wider uppercase text-[9px]">Total Employees</span>
            <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-110 transition-transform"><Users size={16} /></span>
          </div>
          <div className="mt-5 relative z-10">
            <span className="text-3xl font-black text-white leading-none">
              {stats?.totalEmployees || 0}
            </span>
            <span className="text-amber-500 font-bold block mt-1">Active staff profiles</span>
          </div>
          <span className="absolute -right-8 -bottom-8 w-20 h-20 bg-amber-500/5 blur-xl rounded-full"></span>
        </motion.div>

        {/* Card 2: Departments */}
        <motion.div
          whileHover={{ y: -6 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-lg flex flex-col justify-between transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center relative z-10">
            <span className="text-slate-400 dark:text-slate-500 font-black tracking-wider uppercase text-[9px]">Departments</span>
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform"><Building size={16} /></span>
          </div>
          <div className="mt-5 relative z-10">
            <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
              {stats?.departments || 0}
            </span>
            <span className="text-indigo-600 dark:text-indigo-405 font-bold block mt-1">Corporate units</span>
          </div>
          <span className="absolute -right-8 -bottom-8 w-20 h-20 bg-indigo-500/5 blur-xl rounded-full"></span>
        </motion.div>

        {/* Card 3: Pending Leaves */}
        <motion.div
          whileHover={{ y: -6 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-lg flex flex-col justify-between transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center relative z-10">
            <span className="text-slate-400 dark:text-slate-500 font-black tracking-wider uppercase text-[9px]">Pending Leaves</span>
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform"><ClipboardList size={16} /></span>
          </div>
          <div className="mt-5 relative z-10">
            <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
              {stats?.pendingLeaves || 0}
            </span>
            <span className="text-indigo-600 dark:text-indigo-405 font-bold block mt-1">Applications to review</span>
          </div>
          <span className="absolute -right-8 -bottom-8 w-20 h-20 bg-indigo-500/5 blur-xl rounded-full"></span>
        </motion.div>

        {/* Card 4: Active normal POSH cases */}
        <motion.div
          whileHover={{ y: -6 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-lg flex flex-col justify-between transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center relative z-10">
            <span className="text-slate-400 dark:text-slate-500 font-black tracking-wider uppercase text-[9px]">Normal POSH Cases</span>
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform"><ShieldAlert size={16} /></span>
          </div>
          <div className="mt-5 relative z-10">
            <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
              {stats?.pendingPOSH || 0}
            </span>
            <span className="text-indigo-600 dark:text-indigo-405 font-bold block mt-1">Assigned inquiries</span>
          </div>
          <span className="absolute -right-8 -bottom-8 w-20 h-20 bg-indigo-500/5 blur-xl rounded-full"></span>
        </motion.div>

      </div>

      {/* 3. LEAVE APPROVALS TABLE */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
        <div className="flex justify-between items-center mb-5 border-b border-slate-50 dark:border-slate-700/30 pb-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-805 dark:text-white">Outstanding Leave Request Approvals</h3>
          <Link to="/admin/leaves" className="text-indigo-600 dark:text-indigo-400 font-black hover:underline flex items-center gap-1">
            See all requests <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-750/30 border-b border-slate-100 dark:border-slate-700/50 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Leave Type</th>
                <th className="px-4 py-3.5">Filing Range</th>
                <th className="px-4 py-3.5">Days Duration</th>
                <th className="px-4 py-3.5">Reason</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30 text-xs">
              {leaveApprovals && leaveApprovals.map((req: any, idx: number) => (
                <motion.tr
                  key={req._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10"
                >
                  <td className="px-4 py-3.5 font-bold text-slate-850 dark:text-white">
                    {req.employee?.firstName} {req.employee?.lastName}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-350">{req.leaveType}</td>
                  <td className="px-4 py-3.5 text-slate-450 dark:text-slate-500 font-bold">
                    {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 font-extrabold text-indigo-650 dark:text-indigo-400">{req.duration} days</td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 italic">"{req.reason}"</td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      to="/admin/leaves"
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-[10px] font-black rounded-lg text-indigo-600 dark:text-indigo-400 inline-block cursor-pointer transition-all shadow-sm"
                    >
                      Review
                    </Link>
                  </td>
                </motion.tr>
              ))}
              {(!leaveApprovals || leaveApprovals.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-405 font-bold uppercase tracking-wider">
                    No outstanding leave requests to approve.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </FadeInPage>
  );
};

export default AdminDashboard;
