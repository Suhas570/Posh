import React, { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { StatCard, Skeleton, SVGPieChart, FadeInPage } from '../../components/common/UI';
import { ShieldAlert, Users, CalendarCheck, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ICDashboard: React.FC = () => {
  const { showToast } = useNotification();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await api.get('/ic/cases');
        if (res.data.success) {
          setCases(res.data.data);
        }
      } catch (error) {
        showToast('Failed to load IC cases', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  if (loading) return <Skeleton className="h-64" />;

  const total = cases.length;
  const anonymous = cases.filter(c => c.isAnonymous).length;
  const normal = cases.filter(c => !c.isAnonymous).length;
  const newCases = cases.filter(c => c.status === 'New').length;
  const reviewCases = cases.filter(c => c.status === 'Under Review' || c.status === 'Assigned').length;
  const activeInvestigations = cases.filter(c => c.status === 'Investigation').length;
  const closedCases = cases.filter(c => c.status === 'Closed').length;

  const chartData = [
    { name: 'New Cases', value: newCases, color: '#67a2c5' },
    { name: 'Investigation', value: activeInvestigations, color: '#ffb6a6' },
    { name: 'Closed Cases', value: closedCases, color: '#9bcec1' },
    { name: 'Other', value: total - newCases - activeInvestigations - closedCases, color: '#94a3b8' }
  ];

  return (
    <FadeInPage className="space-y-6 text-xs">
      <div>
        <h1 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">Internal Committee POSH Dashboard</h1>
        <p className="text-xs text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-1.5">Strictly confidential portal for reviewing cases, witness logs, and close actions.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Cases Filed"
          value={total}
          icon={<ShieldAlert size={20} />}
          description={`Anonymous: ${anonymous} | Normal: ${normal}`}
        />
        <StatCard
          title="Active Investigations"
          value={activeInvestigations}
          icon={<Users size={20} />}
          description="Cases currently in progress"
        />
        <StatCard
          title="Outstanding Reviews"
          value={newCases + reviewCases}
          icon={<HelpCircle size={20} />}
          description="Requires immediate action"
        />
        <StatCard
          title="Resolved & Closed"
          value={closedCases}
          icon={<CalendarCheck size={20} />}
          description="Completed case histories"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-805 dark:text-white mb-5">Case Status Breakdown</h3>
          <div className="py-6 flex justify-center items-center">
            <SVGPieChart data={chartData} size={150} />
          </div>
        </div>

        {/* Recent Cases */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-805 dark:text-white mb-5">Confidential Complaint Records</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-750/30 border-b border-slate-100 dark:border-slate-700/50 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <th className="px-4 py-3.5">Case ID</th>
                  <th className="px-4 py-3.5">Filing Type</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Accused Person</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30 text-xs">
                {cases.slice(0, 5).map((c, idx) => (
                  <motion.tr
                    key={c._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10"
                  >
                    <td className="px-4 py-3.5 font-extrabold text-indigo-650 dark:text-indigo-400">{c.complaintId}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        c.isAnonymous
                          ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30'
                          : 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/30'
                      }`}>
                        {c.isAnonymous ? 'Anonymous' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-800 dark:text-white font-black">{c.complaintType}</td>
                    <td className="px-4 py-3.5 text-slate-550 dark:text-slate-450 font-bold">{c.accusedPerson}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/ic/cases/${c._id}`}
                        className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-[10px] font-black rounded-lg text-indigo-600 dark:text-indigo-400 inline-block cursor-pointer transition-all shadow-sm"
                      >
                        Investigate
                      </Link>
                    </td>
                  </motion.tr>
                ))}
                {cases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-405 font-bold uppercase tracking-wider">
                      No active cases logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FadeInPage>
  );
};

export default ICDashboard;
