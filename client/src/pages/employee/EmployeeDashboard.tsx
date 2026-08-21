import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { StatCard, StatusBadge, Skeleton, FadeInPage, PremiumButton } from '../../components/common/UI';
import { Calendar, Compass, Clock, BookOpen, Volume2, UserCheck, ShieldCheck, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [clockedIn, setClockedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/employee/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkTodayClockStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get('/employee/profile');
      if (res.data.success) {
        const attendanceRes = await api.get('/admin/attendance');
        const ownRecord = attendanceRes.data.data.find(
          (r: any) => r.employee._id === user?.employeeProfile?._id && r.date.startsWith(today)
        );
        if (ownRecord) {
          setTodayRecord(ownRecord);
          setClockedIn(!ownRecord.clockOut);
        }
      }
    } catch (error) {
      console.log('No clock-in record found for today');
    }
  };

  useEffect(() => {
    fetchDashboardData();
    checkTodayClockStatus();
  }, []);

  const handleClockAction = async () => {
    setClockLoading(true);
    try {
      if (!clockedIn) {
        const res = await api.post('/employee/clock-in', { location: 'Office Desk' });
        if (res.data.success) {
          showToast('Clock-in recorded successfully!', 'success');
          setClockedIn(true);
          setTodayRecord(res.data.data);
        }
      } else {
        const res = await api.post('/employee/clock-out');
        if (res.data.success) {
          showToast('Clock-out recorded. Have a good evening!', 'success');
          setClockedIn(false);
          setTodayRecord(res.data.data);
        }
      }
      fetchDashboardData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Action failed', 'error');
    } finally {
      setClockLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <FadeInPage className="space-y-6">
      
      {/* Redesigned Premium Welcome Banner with animated background grid & blobs */}
      <div className="gradient-primary-bg p-8 rounded-3xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-xl border border-indigo-200/10">
        
        {/* Animated ambient background lights */}
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-32 -left-32 w-80 h-80 bg-purple-500/20 blur-3xl rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-300/15 blur-3xl rounded-full"
        />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight">Welcome back, {user?.employeeProfile?.firstName}!</h1>
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mt-2.5">
            Review your daily schedule, check leave balance, and log attendance.
          </p>
        </div>
        
        {/* Clock widget */}
        <div className="bg-white/10 backdrop-blur-md px-6 py-5 rounded-2xl border border-white/10 flex items-center gap-6 w-full md:w-auto relative z-10">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Today's Shift</span>
            <span className="font-extrabold text-md mt-1 block">
              {todayRecord ? (todayRecord.clockOut ? 'Completed' : 'Active') : 'Not Checked-In'}
            </span>
          </div>
          <button
            onClick={handleClockAction}
            disabled={clockLoading}
            className={`px-5 py-3 rounded-xl text-xs font-black shadow-lg cursor-pointer transition-all uppercase tracking-wider ${
              clockedIn
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                : 'bg-white text-indigo-700 hover:bg-indigo-50 shadow-white/20'
            }`}
          >
            {clockLoading ? (
              <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            ) : clockedIn ? (
              'Punch Out'
            ) : (
              'Punch In'
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Leave Balance"
          value={`${data?.leaveBalance || 30} Days`}
          icon={<Calendar size={20} />}
          description="Allowed annual balance"
        />
        <StatCard
          title="Leaves Used"
          value={`${data?.leavesTaken || 0} Days`}
          icon={<Clock size={20} />}
          description="Applied leave total"
        />
        <StatCard
          title="Present (Current Month)"
          value={`${data?.attendanceStats?.present || 0} Days`}
          icon={<UserCheck size={20} />}
          description={`Lates: ${data?.attendanceStats?.late || 0}`}
        />
        <StatCard
          title="Enrolled Trainings"
          value={user?.employeeProfile?.trainings?.filter((t: any) => t.status !== 'Completed').length || 0}
          icon={<BookOpen size={20} />}
          description="Programs in progress"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Announcements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Volume2 size={16} />
              </div>
              <h2 className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-wider">Recent Announcements</h2>
            </div>
            
            <div className="space-y-4">
              {data?.announcements && data.announcements.length > 0 ? (
                data.announcements.map((ann: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-150/40 dark:border-slate-700/30 hover:border-indigo-100 dark:hover:border-indigo-950/40 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-white leading-snug">{ann.title}</h4>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30">
                        {ann.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">{ann.content}</p>
                    <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-700/20 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Posted by: {ann.author}</span>
                      <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-wider">No active announcements</div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Recent Leaves */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-white mb-5">My Leave Requests</h3>
            <div className="space-y-3">
              {data?.recentLeaves && data.recentLeaves.length > 0 ? (
                data.recentLeaves.map((leave: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/20 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700/40">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white">{leave.type}</h4>
                      <span className="text-[10px] text-slate-400 mt-1 block font-bold">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <StatusBadge status={leave.status} />
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-wider">No leave requests found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FadeInPage>
  );
};

export default EmployeeDashboard;
