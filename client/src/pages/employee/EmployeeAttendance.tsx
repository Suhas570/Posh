import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { StatusBadge, Skeleton } from '../../components/common/UI';
import { Calendar, Clock, MapPin, Monitor } from 'lucide-react';

const EmployeeAttendance: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/admin/attendance'); // Fetches logs
        // Filter own attendance
        const ownLogs = res.data.data.filter(
          (r: any) => r.employee._id === user?.employeeProfile?._id
        );
        setAttendance(ownLogs);
      } catch (error: any) {
        showToast('Failed to load attendance logs', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [user]);

  if (loading) {
    return <Skeleton className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Attendance Logs</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Review your daily punch-in/out timestamps and locations</p>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Present Days</span>
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              {attendance.filter(r => r.status === 'Present').length} Days
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 border-y md:border-y-0 md:border-x border-gray-100 dark:border-gray-700/30 py-4 md:py-0 md:px-6">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Late Check-Ins</span>
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              {attendance.filter(r => r.status === 'Late').length} Days
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:pl-6">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Monitor size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Total Logged Hours</span>
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              {attendance.reduce((sum, record) => sum + (record.hoursWorked || 0), 0).toFixed(2)} Hrs
            </span>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 text-[10px] uppercase font-bold tracking-wider text-gray-400">
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
              {attendance.length > 0 ? (
                attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">
                      {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(record.clockIn).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {record.clockOut ? (
                        new Date(record.clockOut).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                      ) : (
                        <span className="text-amber-500 font-semibold">Active Shift</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                      <MapPin size={12} className="text-gray-400" />
                      {record.location}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {record.ipAddress || '192.168.1.10'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-200">
                      {record.hoursWorked ? `${record.hoursWorked} hrs` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                    No attendance records found. Click "Punch In" on the dashboard to log your shift today.
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

export default EmployeeAttendance;
