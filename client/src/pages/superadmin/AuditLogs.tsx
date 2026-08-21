import React, { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { Skeleton } from '../../components/common/UI';
import { Search, History, Clock } from 'lucide-react';

const AuditLogs: React.FC = () => {
  const { showToast } = useNotification();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/superadmin/audit-logs');
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (error) {
        showToast('Failed to load system audit trails', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    return (
      log.email.toLowerCase().includes(term) ||
      log.role.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term)
    );
  });

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <History size={22} className="text-indigo-600 dark:text-indigo-400" />
          Security Audit Trails
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Read-only operational history logs of logins, profile deletions, and system configuration modifications.</p>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search audit trail by user, action, detail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Logs timeline list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-6 space-y-6">
        <div className="border-l border-gray-200 dark:border-gray-700 ml-3 pl-6 space-y-6">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log._id} className="relative">
                {/* Node indicator */}
                <span className="absolute -left-[31px] top-1 bg-white dark:bg-gray-800 border-2 border-indigo-600 rounded-full p-0.5 text-indigo-600">
                  <Clock size={10} />
                </span>
                
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {log.action}
                      </span>
                      <strong className="text-gray-800 dark:text-white font-bold">{log.details}</strong>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-450 dark:text-gray-400 mt-1 font-semibold">
                    Actor: <span className="text-indigo-600 dark:text-indigo-400">{log.email}</span> ({log.role}) • IP: {log.ipAddress || '127.0.0.1'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 font-medium -ml-6">
              No audit logs found matching criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
