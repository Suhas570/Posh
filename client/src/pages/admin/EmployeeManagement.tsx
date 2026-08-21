import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { StatusBadge, Skeleton, ConfirmDialog } from '../../components/common/UI';
import { UserPlus, Edit2, Trash2, Search, Filter } from 'lucide-react';

const EmployeeManagement: React.FC = () => {
  const { showToast } = useNotification();
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals status
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const loadData = async () => {
    try {
      const empRes = await api.get('/admin/employees');
      const deptRes = await api.get('/admin/departments');
      if (empRes.data.success) setEmployees(empRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
    } catch (error) {
      showToast('Failed to load employee list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEmployee = async (data: any) => {
    try {
      const payload = {
        ...data,
        baseSalary: parseFloat(data.baseSalary),
        bankDetails: {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          ifscCode: data.ifscCode
        }
      };

      const res = await api.post('/admin/employees', payload);
      if (res.data.success) {
        showToast('Employee profile created successfully!', 'success');
        reset();
        setShowAddModal(false);
        loadData();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create profile', 'error');
    }
  };

  const handleUpdateEmployee = async (data: any) => {
    try {
      const payload = {
        ...data,
        baseSalary: parseFloat(data.baseSalary),
        bankDetails: {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          ifscCode: data.ifscCode
        }
      };

      const res = await api.put(`/admin/employees/${editingEmployee._id}`, payload);
      if (res.data.success) {
        showToast('Employee profile updated successfully!', 'success');
        reset();
        setEditingEmployee(null);
        loadData();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deletingEmployeeId) return;
    try {
      const res = await api.delete(`/admin/employees/${deletingEmployeeId}`);
      if (res.data.success) {
        showToast('Employee profile deleted successfully!', 'success');
        setDeletingEmployeeId(null);
        loadData();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete profile', 'error');
    }
  };

  const openEditModal = (emp: any) => {
    setEditingEmployee(emp);
    setValue('firstName', emp.firstName);
    setValue('lastName', emp.lastName);
    setValue('employeeId', emp.employeeId);
    setValue('jobTitle', emp.jobTitle);
    setValue('phone', emp.phone);
    setValue('dateOfJoining', emp.dateOfJoining.split('T')[0]);
    setValue('baseSalary', emp.baseSalary);
    setValue('department', emp.department?._id || emp.department);
    setValue('status', emp.status);
    setValue('bankName', emp.bankDetails?.bankName);
    setValue('accountNumber', emp.bankDetails?.accountNumber);
    setValue('ifscCode', emp.bankDetails?.ifscCode);
  };

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || emp.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === '' || (emp.department?._id || emp.department) === deptFilter;
    return matchesSearch && matchesDept;
  });

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Employee Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">View and manage company personnel records</p>
        </div>
        <button
          onClick={() => { reset(); setShowAddModal(true); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <UserPlus size={16} />
          Add Employee
        </button>
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
          <Filter size={14} className="text-gray-400 shrink-0" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full sm:w-44 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Date Joined</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/30 text-xs">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10">
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">
                      {emp.employeeId}
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-white font-semibold">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-semibold">
                      {emp.department?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {emp.jobTitle}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(emp.dateOfJoining).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {emp.phone}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg cursor-pointer"
                        title="Edit profile"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingEmployeeId(emp._id)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg cursor-pointer"
                        title="Delete profile"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400 font-medium">
                    No employee profiles match criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL FORM */}
      {(showAddModal || editingEmployee) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700/50">
              <span className="font-bold text-sm text-gray-800 dark:text-white">
                {editingEmployee ? 'Edit Employee Details' : 'Create New Employee Profile'}
              </span>
              <button
                onClick={() => { setShowAddModal(false); setEditingEmployee(null); }}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit(editingEmployee ? handleUpdateEmployee : handleCreateEmployee)} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">First Name</label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'Required' })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Last Name</label>
                  <input
                    type="text"
                    {...register('lastName', { required: 'Required' })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-101"
                    {...register('employeeId', { required: 'Required' })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Department</label>
                  <select
                    {...register('department', { required: 'Required' })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none text-gray-950 dark:text-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Recruiter"
                    {...register('jobTitle', { required: 'Required' })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Phone</label>
                  <input
                    type="text"
                    {...register('phone', { required: 'Required' })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Date Joined</label>
                  <input
                    type="date"
                    {...register('dateOfJoining', { required: 'Required' })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Base Salary ($)</label>
                  <input
                    type="number"
                    {...register('baseSalary', { required: 'Required' })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                  />
                </div>
                {editingEmployee && (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Status</label>
                    <select
                      {...register('status', { required: 'Required' })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none text-gray-950 dark:text-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                )}
              </div>

              {/* BANK DETAILS SECTION */}
              <div className="border-t border-gray-100 dark:border-gray-700/50 pt-4 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Disbursement Bank details</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      {...register('bankName', { required: 'Required' })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Account Number</label>
                    <input
                      type="text"
                      {...register('accountNumber', { required: 'Required' })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">IFSC / Routing Code</label>
                    <input
                      type="text"
                      {...register('ifscCode', { required: 'Required' })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingEmployee(null); }}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deletingEmployeeId !== null}
        onClose={() => setDeletingEmployeeId(null)}
        onConfirm={handleDeleteEmployee}
        title="Delete Employee Profile"
        message="Are you sure you want to delete this employee profile? This will also permanently deactivate their associated user credentials."
        confirmText="Delete Profile"
        type="danger"
      />
    </div>
  );
};

export default EmployeeManagement;
