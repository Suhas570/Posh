import React, { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { StatusBadge, Skeleton } from '../../components/common/UI';
import { Search, CheckCircle, XCircle } from 'lucide-react';

const LeaveApprovals: React.FC = () => {
  const { showToast } = useNotification();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [actionRemarks, setActionRemarks] = useState('');

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/admin/leaves');
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (error) {
      showToast('Failed to load leave requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleReview = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await api.put(`/admin/leaves/${id}/review`, {
        status,
        remarks: actionRemarks
      });
      if (res.data.success) {
        showToast(`Leave request ${status.toLowerCase()} successfully!`, 'success');
        setSelectedLeave(null);
        setActionRemarks('');
        fetchLeaves();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Action failed', 'error');
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    if (!l.employee) return false;
    const name = `${l.employee.firstName} ${l.employee.lastName}`.toLowerCase();
    const type = l.type.toLowerCase();
    return name.includes(search.toLowerCase()) || type.includes(search.toLowerCase());
  });

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Leave Approvals</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Review, approve, or reject employee time-off applications</p>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search by employee or leave type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Employee Name</th>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/30 text-xs">
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((l) => (
                  <tr key={l._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10">
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">
                      {l.employee?.employeeId}
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-white font-semibold">
                      {l.employee?.firstName} {l.employee?.lastName}
                    </td>
                    <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-bold">{l.type}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-semibold">
                      {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate" title={l.reason}>
                      {l.reason}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {l.status === 'Pending' ? (
                        <button
                          onClick={() => setSelectedLeave(l)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] ml-auto cursor-pointer"
                        >
                          Review Request
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold italic">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal Dialog */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
              <span className="font-bold text-sm text-gray-800 dark:text-white">Review Leave Application</span>
              <button onClick={() => setSelectedLeave(null)} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/25 p-4 rounded-xl border border-gray-100 dark:border-gray-700/30 text-xs">
                <p className="font-bold text-gray-800 dark:text-white">
                  Applicant: {selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName}
                </p>
                <p className="mt-1 font-semibold text-indigo-600 dark:text-indigo-400">
                  Type: {selectedLeave.type}
                </p>
                <p className="mt-0.5 text-gray-500">
                  Reason: "{selectedLeave.reason}"
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Approver Remarks / feedback</label>
                <textarea
                  rows={3}
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Enter comments for the employee..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-700/20 border-t border-gray-100 dark:border-gray-700/50">
              <button
                onClick={() => handleReview(selectedLeave._id, 'Rejected')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <XCircle size={14} />
                Reject
              </button>
              <button
                onClick={() => handleReview(selectedLeave._id, 'Approved')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle size={14} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovals;
