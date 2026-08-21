import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { StatusBadge, Skeleton } from '../../components/common/UI';
import { FileText, DollarSign, Plus } from 'lucide-react';

const PayrollManagement: React.FC = () => {
  const { showToast } = useNotification();
  const [payroll, setPayroll] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProcessForm, setShowProcessForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = async () => {
    try {
      const payRes = await api.get('/admin/payroll');
      const empRes = await api.get('/admin/employees');
      if (payRes.data.success) setPayroll(payRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    } catch (error) {
      showToast('Failed to load payroll records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        month: parseInt(data.month),
        year: parseInt(data.year),
        allowances: parseFloat(data.allowances || 0),
        deductions: parseFloat(data.deductions || 0)
      };

      const res = await api.post('/admin/payroll/process', payload);
      if (res.data.success) {
        showToast('Payroll processed successfully!', 'success');
        reset();
        setShowProcessForm(false);
        loadData();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to process payroll', 'error');
    }
  };

  const getMonthName = (monthNum: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1] || 'Unknown';
  };

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Payroll Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Process monthly salaries and issue electronic statements</p>
        </div>
        <button
          onClick={() => setShowProcessForm(!showProcessForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus size={16} />
          {showProcessForm ? 'View Ledger' : 'Process Payroll'}
        </button>
      </div>

      {showProcessForm ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm max-w-md">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Process Monthly Statement</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Select Employee</label>
              <select
                {...register('employeeId', { required: 'Required' })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none text-gray-950 dark:text-white"
              >
                <option value="">Choose Employee</option>
                {employees.map(e => (
                  <option key={e._id} value={e._id}>{e.firstName} {e.lastName} (Salary: ${e.baseSalary})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Month (1-12)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  {...register('month', { required: 'Required', min: 1, max: 12 })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Year</label>
                <input
                  type="number"
                  defaultValue={new Date().getFullYear()}
                  {...register('year', { required: 'Required' })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Allowances ($)</label>
                <input
                  type="number"
                  placeholder="0"
                  {...register('allowances')}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Deductions ($)</label>
                <input
                  type="number"
                  placeholder="0"
                  {...register('deductions')}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProcessForm(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold cursor-pointer"
              >
                Process & Post
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  <th className="px-6 py-4">Employee ID</th>
                  <th className="px-6 py-4">Employee Name</th>
                  <th className="px-6 py-4">Billing Period</th>
                  <th className="px-6 py-4">Basic Pay</th>
                  <th className="px-6 py-4">Allowances</th>
                  <th className="px-6 py-4">Deductions</th>
                  <th className="px-6 py-4">Net Salary</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/30 text-xs">
                {payroll.length > 0 ? (
                  payroll.map((slip) => (
                    <tr key={slip._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10">
                      <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">
                        {slip.employee?.employeeId}
                      </td>
                      <td className="px-6 py-4 text-gray-800 dark:text-white font-semibold">
                        {slip.employee?.firstName} {slip.employee?.lastName}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-200">
                        {getMonthName(slip.month)} {slip.year}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-semibold">${slip.basicSalary}</td>
                      <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-semibold">+${slip.allowances || 0}</td>
                      <td className="px-6 py-4 text-rose-600 dark:text-rose-400 font-semibold">-${slip.deductions || 0}</td>
                      <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-bold">${slip.netSalary}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={slip.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-400 font-medium">
                      No payroll records generated yet.
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

export default PayrollManagement;
