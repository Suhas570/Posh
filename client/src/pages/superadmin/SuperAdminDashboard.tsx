import React, { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { StatCard, Skeleton, SVGPieChart } from '../../components/common/UI';
import { Users, Activity, ShieldAlert, Cpu } from 'lucide-react';

const SuperAdminDashboard: React.FC = () => {
  const { showToast } = useNotification();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/superadmin/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        showToast('Failed to load system metrics', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <Skeleton className="h-64" />;
  }

  // Format roles distribution for Pie Chart
  const roleChartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
  const chartData = data?.rolesDistribution?.map((role: any, index: number) => ({
    name: role.name,
    value: role.count,
    color: roleChartColors[index % roleChartColors.length]
  })) || [];

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">System architecture health, login auditing, and global account settings</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Portal Users"
          value={data?.stats?.users || 0}
          icon={<Users size={20} />}
          description="Registered system log-ins"
        />
        <StatCard
          title="Active Sessions"
          value={data?.stats?.activeSessions || 0}
          icon={<Activity size={20} />}
          description="Concurrent online users"
        />
        <StatCard
          title="App Memory allocation"
          value={data?.stats?.systemHealth?.memoryUsed || '0 MB'}
          icon={<Cpu size={20} />}
          description="Heap memory usage"
        />
        <StatCard
          title="API Latency"
          value={data?.stats?.systemHealth?.apiLatency || 'N/A'}
          icon={<Activity size={20} />}
          description="Average response time"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Roles distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-sm text-gray-800 dark:text-white mb-4 font-sans">Security Roles Distribution</h3>
          <div className="py-4">
            <SVGPieChart data={chartData} size={155} />
          </div>
        </div>

        {/* System audit log stream */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
          <h3 className="font-bold text-sm text-gray-800 dark:text-white mb-4">Security & Activity Audit Logs</h3>
          
          <div className="space-y-4 max-h-72 overflow-y-auto pr-2 divide-y divide-gray-100 dark:divide-gray-700/30">
            {data?.auditLogs && data.auditLogs.length > 0 ? (
              data.auditLogs.map((log: any, idx: number) => (
                <div key={log._id} className="pt-3 first:pt-0 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold text-[9px] tracking-wide">
                      {log.action}
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 font-semibold">{log.details}</p>
                    <div className="text-[10px] text-gray-400 font-bold">
                      By: {log.email} ({log.role}) • IP: {log.ipAddress || '127.0.0.1'}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">No activity logs recorded</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
