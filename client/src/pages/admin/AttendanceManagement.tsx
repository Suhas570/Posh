import React, { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { StatusBadge, Skeleton } from '../../components/common/UI';
import { Search, Calendar, MapPin } from 'lucide-react';

const AttendanceManagement: React.FC = () => {
  const { showToast } = useNotification();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchAttendance = async () => {
    try {
      let url = '/admin/attendance';
      if (dateFilter) {
        url += `?date=${dateFilter}`;
      }
      const res = await api.get(url);
      if (res.data.success) {
        setAttendance(res.data.data);
      }
    } catch (error) {
      showToast('Failed to load attendance logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter]);

  const filteredLogs = attendance.filter((log) => {
    if (!log.employee) return false;
    const name = `${log.employee.firstName} ${log.employee.lastName}`.toLowerCase();
    const id = log.employee.employeeId.toLowerCase();
    return name.includes(search.toLowerCase()) || id.includes(search.toLowerCase());
  });

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Attendance Logs</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">View and track employee clock-in/out timestamps and locations</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar size={14} className="text-gray-400 shrink-0" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-44 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-950 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Clock In</th>
                <th className="px-6 py-4">Clock Out</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Hours</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/30 text-xs">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10">
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">
                      {log.employee?.employeeId}
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-white font-semibold">
                      {log.employee?.firstName} {log.employee?.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(log.clockIn).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {log.clockOut ? (
                        new Date(log.clockOut).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                      ) : (
                        <span className="text-amber-500 font-semibold">Active Shift</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-gray-400 shrink-0" />
                      {log.location}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{log.ipAddress || '192.168.1.1'}</td>
                    <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-200">
                      {log.hoursWorked ? `${log.hoursWorked} hrs` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={log.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-400 font-medium">
                    No attendance logs found for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
