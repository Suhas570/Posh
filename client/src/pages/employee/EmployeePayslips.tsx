import React, { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { StatusBadge, Skeleton } from '../../components/common/UI';
import { FileText, Printer, DollarSign } from 'lucide-react';

const EmployeePayslips: React.FC = () => {
  const { showToast } = useNotification();
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const res = await api.get('/employee/payslips');
        if (res.data.success) {
          setPayslips(res.data.data);
        }
      } catch (error) {
        showToast('Failed to load payslip data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, []);

  const getMonthName = (monthNum: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1] || 'Unknown';
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Skeleton className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Payslips</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">View and print your monthly salary statements</p>
      </div>

      {/* Payslips Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                <th className="px-6 py-4">Statement Period</th>
                <th className="px-6 py-4">Basic Pay</th>
                <th className="px-6 py-4">Allowances</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Salary</th>
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/30 text-xs">
              {payslips.length > 0 ? (
                payslips.map((slip) => (
                  <tr key={slip._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10">
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">
                      {getMonthName(slip.month)} {slip.year}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-semibold">
                      ${slip.basicSalary}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                      +${slip.allowances || 0}
                    </td>
                    <td className="px-6 py-4 text-rose-600 dark:text-rose-400 font-semibold">
                      -${slip.deductions || 0}
                    </td>
                    <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-bold">
                      ${slip.netSalary}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={slip.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedPayslip(slip)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-[10px] font-bold rounded-lg text-indigo-600 dark:text-indigo-400 flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <FileText size={12} />
                        View Slip
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                    No payslips generated yet for this financial period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal (Print-friendly) */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:p-0 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden print:shadow-none print:border-none print:my-0">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700/50 print:hidden">
              <span className="font-bold text-sm text-gray-800 dark:text-white">Monthly Payslip Statement</span>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Slip Printable area */}
            <div className="p-8 space-y-6 text-gray-800 dark:text-gray-100 print:p-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Enterprise HRMS Ltd</h2>
                  <p className="text-xs text-gray-400 mt-1">Silicon Valley, Bangalore</p>
                </div>
                <div className="text-right">
                  <h3 className="text-md font-bold uppercase tracking-wide">Payslip</h3>
                  <p className="text-xs text-gray-500 font-bold mt-1">
                    Period: {getMonthName(selectedPayslip.month)} {selectedPayslip.year}
                  </p>
                </div>
              </div>

              {/* Employee Details block */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 dark:bg-gray-700/20 p-4 rounded-xl border border-gray-100 dark:border-gray-700/30">
                <div>
                  <span className="text-gray-400 block font-semibold">Employee Name:</span>
                  <span className="font-bold mt-0.5 block">
                    {selectedPayslip.employee?.firstName} {selectedPayslip.employee?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">Employee ID:</span>
                  <span className="font-bold mt-0.5 block">{selectedPayslip.employee?.employeeId}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">Job Title:</span>
                  <span className="font-bold mt-0.5 block">{selectedPayslip.employee?.jobTitle}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">Bank details:</span>
                  <span className="font-bold mt-0.5 block">
                    {selectedPayslip.employee?.bankDetails?.bankName} - A/C: {selectedPayslip.employee?.bankDetails?.accountNumber}
                  </span>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                {/* Earnings */}
                <div className="border border-gray-100 dark:border-gray-700/50 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 border-b border-gray-100 dark:border-gray-700/50 text-emerald-800 dark:text-emerald-300 font-bold">
                    Earnings (Credits)
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-medium">Basic Salary:</span>
                      <span className="font-bold">${selectedPayslip.basicSalary}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 dark:border-gray-700/30 pb-2">
                      <span className="text-gray-400 font-medium">House Rent Allowance:</span>
                      <span className="font-bold">${selectedPayslip.allowances}</span>
                    </div>
                    <div className="flex justify-between pt-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Total Earnings:</span>
                      <span>${selectedPayslip.basicSalary + selectedPayslip.allowances}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-gray-100 dark:border-gray-700/50 rounded-xl overflow-hidden">
                  <div className="bg-rose-50 dark:bg-rose-950/20 px-4 py-2 border-b border-gray-100 dark:border-gray-700/50 text-rose-800 dark:text-rose-300 font-bold">
                    Deductions (Debits)
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between border-b border-gray-50 dark:border-gray-700/30 pb-2">
                      <span className="text-gray-400 font-medium">Professional Tax & PF:</span>
                      <span className="font-bold">${selectedPayslip.deductions}</span>
                    </div>
                    <div className="flex justify-between pt-1 font-bold text-rose-600 dark:text-rose-400">
                      <span>Total Deductions:</span>
                      <span>${selectedPayslip.deductions}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net pay summary */}
              <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100/30 font-bold">
                <div className="text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                  <DollarSign size={16} />
                  Net Take-Home Pay:
                </div>
                <div className="text-indigo-600 dark:text-indigo-400 text-lg">
                  ${selectedPayslip.netSalary}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-700/20 border-t border-gray-100 dark:border-gray-700/50 print:hidden">
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Printer size={14} />
                Print Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePayslips;
