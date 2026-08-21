import React, { useEffect, useState } from 'react';
import { Users, Search, ShieldCheck, Ban, Trash2, CheckCircle, UserCheck } from 'lucide-react';
import { adminService } from '../../services/adminService';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await adminService.getUsers();
    setUsers(data);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await adminService.toggleUserStatus(id, newStatus);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this user account?')) return;
    await adminService.deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const filtered = users.filter(u => {
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">User & Role Management</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Super Admin authority over Students, Tutors, and Platform Admins.</p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'STUDENT', 'TUTOR', 'ADMIN'].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterRole === role
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-800 text-slate-400 text-xs max-w-md">
        <Search size={16} />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by name or email..."
          className="bg-transparent border-none outline-none text-slate-200 text-xs w-full"
        />
      </div>

      {/* Users Table */}
      <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">User Name & Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-slate-900/40 transition-all">
                <td className="p-4 flex flex-col">
                  <span className="font-extrabold text-white">{user.name}</span>
                  <span className="text-slate-500 text-[11px]">{user.email}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border ${
                    user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                    user.role === 'TUTOR' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                    'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    user.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-slate-400">{user.joined}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        user.status === 'ACTIVE'
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                      title={user.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                    >
                      {user.status === 'ACTIVE' ? <Ban size={14} /> : <UserCheck size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all cursor-pointer"
                      title="Delete User"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
