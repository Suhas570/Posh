import React, { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { Skeleton } from '../../components/common/UI';
import { UserCheck, Sliders, Search } from 'lucide-react';

const UserManagement: React.FC = () => {
  const { showToast } = useNotification();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newRole, setNewRole] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/superadmin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      showToast('Failed to load user portal accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) return;
    try {
      const res = await api.put(`/superadmin/users/${editingUser._id}/role`, {
        role: newRole
      });
      if (res.data.success) {
        showToast('User credentials authorization role updated!', 'success');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Update failed', 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    return u.email.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Account Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Review portal log-ins, security credentials, and portal routing rules</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search by email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                <th className="px-6 py-4">User email Address</th>
                <th className="px-6 py-4">Auth Clearance Role</th>
                <th className="px-6 py-4">Linked Employee Profile</th>
                <th className="px-6 py-4">Account Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/30 text-xs">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10">
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-semibold">
                      {u.employeeProfile ? `${u.employeeProfile.firstName} ${u.employeeProfile.lastName} (${u.employeeProfile.employeeId})` : 'System Level (No profile)'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setEditingUser(u); setNewRole(u.role); }}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-[10px] font-bold rounded-lg text-indigo-600 dark:text-indigo-400 flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Sliders size={12} />
                        Update Role
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-medium">
                    No system portal users found matching search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE ROLE MODAL DIALOG */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
              <span className="font-bold text-sm text-gray-800 dark:text-white">Change User Portal Role</span>
              <button onClick={() => setEditingUser(null)} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/25 p-4 rounded-xl border border-gray-100 dark:border-gray-700/30 text-xs">
                <span className="text-gray-400 block mb-1">Target Account:</span>
                <span className="font-bold text-gray-850 dark:text-white block">{editingUser.email}</span>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">New Security Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none text-gray-950 dark:text-white"
                >
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Internal Committee">Internal Committee</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer animate-pulse"
                >
                  <UserCheck size={14} />
                  Update Clearance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
