import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { Skeleton } from '../../components/common/UI';
import { Building, Plus, UserCheck } from 'lucide-react';

const DepartmentManagement: React.FC = () => {
  const { showToast } = useNotification();
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = async () => {
    try {
      const deptRes = await api.get('/admin/departments');
      const empRes = await api.get('/admin/employees');
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    } catch (error) {
      showToast('Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const res = await api.post('/admin/departments', data);
      if (res.data.success) {
        showToast('Department created successfully!', 'success');
        reset();
        setShowAddForm(false);
        loadData();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create department', 'error');
    }
  };

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Department Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Configure corporate organizational structures and unit managers</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus size={16} />
          {showAddForm ? 'View Departments' : 'New Department'}
        </button>
      </div>

      {showAddForm ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm max-w-md">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Create New Department</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Department Name</label>
              <input
                type="text"
                placeholder="e.g. Sales & Marketing"
                {...register('name', { required: 'Required' })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Department Code</label>
              <input
                type="text"
                placeholder="e.g. MKT"
                {...register('code', { required: 'Required' })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Department Manager</label>
              <select
                {...register('manager')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none text-gray-950 dark:text-white"
              >
                <option value="">Select Manager</option>
                {employees.map(e => (
                  <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Description</label>
              <textarea
                rows={3}
                {...register('description')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departments.map(d => (
            <div key={d._id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm tracking-wide">{d.code}</span>
                  <h3 className="font-bold text-sm text-gray-800 dark:text-white mt-1">{d.name}</h3>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Building size={20} />
                </div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3 line-clamp-2 h-8">
                {d.description || 'No description provided'}
              </p>
              <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-50 dark:border-gray-700/30">
                <span className="text-gray-400 font-semibold flex items-center gap-1">
                  <UserCheck size={14} className="text-indigo-600" />
                  Manager:
                </span>
                <span className="font-bold text-gray-700 dark:text-gray-200">
                  {d.manager ? `${d.manager.firstName} ${d.manager.lastName}` : 'Unassigned'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
