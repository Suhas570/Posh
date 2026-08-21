import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { StatusBadge, Skeleton } from '../../components/common/UI';
import { CalendarRange, ClipboardList, Send } from 'lucide-react';

const EmployeeLeave: React.FC = () => {
  const { showToast } = useNotification();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/employee/leaves');
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (error) {
      showToast('Failed to load leave history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const onSubmit = async (data: any) => {
    setSubmitLoading(true);
    try {
      const res = await api.post('/employee/leave', data);
      if (res.data.success) {
        showToast('Leave request submitted successfully!', 'success');
        reset();
        setShowApplyForm(false);
        fetchLeaves();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to submit leave request', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Request time off and track your approval status</p>
        </div>
        <button
          onClick={() => setShowApplyForm(!showApplyForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <CalendarRange size={16} />
          {showApplyForm ? 'View Requests' : 'Apply for Leave'}
        </button>
      </div>

      {showApplyForm ? (
        /* APPLY FOR LEAVE FORM */
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm max-w-xl animate-fade-in">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <ClipboardList size={18} className="text-indigo-600" />
            New Leave Request
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Leave Type</label>
                <select
                  {...register('type', { required: 'Select leave type' })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Maternity">Maternity Leave</option>
                  <option value="Paternity">Paternity Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
                {errors.type && <span className="text-rose-500 text-[10px] mt-1 block">{errors.type.message as string}</span>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Start Date</label>
                <input
                  type="date"
                  {...register('startDate', { required: 'Start date is required' })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.startDate && <span className="text-rose-500 text-[10px] mt-1 block">{errors.startDate.message as string}</span>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5">End Date</label>
                <input
                  type="date"
                  {...register('endDate', { required: 'End date is required' })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.endDate && <span className="text-rose-500 text-[10px] mt-1 block">{errors.endDate.message as string}</span>}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Reason / Comments</label>
              <textarea
                rows={3}
                placeholder="Brief description of why you are requesting leave..."
                {...register('reason', { required: 'Please enter a reason' })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              ></textarea>
              {errors.reason && <span className="text-rose-500 text-[10px] mt-1 block">{errors.reason.message as string}</span>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowApplyForm(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Send size={14} />
                {submitLoading ? 'Sending...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* LEAVE HISTORY TABLE */
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Total Days</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Approver Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/30 text-xs">
                {leaves.length > 0 ? (
                  leaves.map((leave) => {
                    const start = new Date(leave.startDate);
                    const end = new Date(leave.endDate);
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                    return (
                      <tr key={leave._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10">
                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">
                          {leave.type}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-semibold">
                          {start.toLocaleDateString()} to {end.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-200 font-bold">
                          {diffDays} {diffDays === 1 ? 'day' : 'days'}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate" title={leave.reason}>
                          {leave.reason}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={leave.status} />
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 italic">
                          {leave.remarks || '-'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400 font-medium">
                      No leave history records found. Click "Apply for Leave" to submit your first request.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeave;
