import React, { useEffect, useState } from 'react';
import { Users, Search, CheckCircle, XCircle, Ban, UserCheck, Plus, Trash2, ShieldCheck, Clock } from 'lucide-react';
import apiClient from '../../api/client';

const ManageTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState('');
  const [filterApproval, setFilterApproval] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async () => {
    try {
      const res = await apiClient.get('/api/admin/tutors');
      setTutors(res.data);
    } catch (e) {
      setTutors([]);
    }
  };

  const handleApprove = async (id, approvalStatus) => {
    try {
      const res = await apiClient.put(`/api/admin/tutors/${id}/approve`, { approvalStatus });
      setTutors(prev => prev.map(t => t.id === id ? { ...t, approvalStatus: res.data.approvalStatus, status: res.data.status } : t));
    } catch (e) {}
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await apiClient.put(`/api/admin/tutors/${id}/status`, { status: newStatus });
      setTutors(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Super Admin Warning: Permanently delete this Tutor account?')) return;
    try {
      await apiClient.delete(`/api/admin/tutors/${id}`);
      setTutors(prev => prev.filter(t => t.id !== id));
    } catch (e) {}
  };

  const handleCreateTutor = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    try {
      const res = await apiClient.post('/api/admin/tutors', { name, email });
      setTutors(prev => [...prev, res.data]);
      setName('');
      setEmail('');
      setShowAddModal(false);
    } catch (e) {}
  };

  const filtered = tutors.filter(t => {
    const matchesApproval = filterApproval === 'ALL' || t.approvalStatus === filterApproval;
    const matchesSearch = (t.name || '').toLowerCase().includes(search.toLowerCase()) || (t.email || '').toLowerCase().includes(search.toLowerCase());
    return matchesApproval && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Tutor Management & Approval Pipeline</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Super Admin authority to Approve, Reject, Create, Suspend, or Remove Tutor accounts.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-purple-500/20"
        >
          <Plus size={14} /> Add New Tutor
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 text-slate-400 text-xs max-w-md w-full">
          <Search size={16} />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tutors by name or email..."
            className="bg-transparent border-none outline-none text-slate-200 text-xs w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(st => (
            <button
              key={st}
              onClick={() => setFilterApproval(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterApproval === st
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tutor Management Table */}
      <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Tutor Profile</th>
              <th className="p-4">Approval Workflow</th>
              <th className="p-4">Account Status</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4 text-right">Super Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {filtered.map(tutor => (
              <tr key={tutor.id} className="hover:bg-slate-900/40 transition-all">
                <td className="p-4 flex flex-col">
                  <span className="font-extrabold text-white">{tutor.name}</span>
                  <span className="text-slate-500 text-[11px]">{tutor.email}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                    tutor.approvalStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    tutor.approvalStatus === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                    'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                  }`}>
                    {tutor.approvalStatus || 'PENDING'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    tutor.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                  }`}>
                    {tutor.status || 'ACTIVE'}
                  </span>
                </td>
                <td className="p-4 text-slate-400">{tutor.joined}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {tutor.approvalStatus !== 'APPROVED' && (
                      <button
                        onClick={() => handleApprove(tutor.id, 'APPROVED')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm shadow-emerald-500/20"
                        title="Approve Tutor Account"
                      >
                        <CheckCircle size={12} /> Approve
                      </button>
                    )}
                    {tutor.approvalStatus !== 'REJECTED' && (
                      <button
                        onClick={() => handleApprove(tutor.id, 'REJECTED')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                        title="Reject Tutor Account"
                      >
                        <XCircle size={12} /> Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusToggle(tutor.id, tutor.status)}
                      className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        tutor.status === 'ACTIVE'
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                      title={tutor.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                    >
                      {tutor.status === 'ACTIVE' ? <Ban size={14} /> : <UserCheck size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(tutor.id)}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all cursor-pointer"
                      title="Delete Tutor Account"
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

      {/* Add Tutor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateTutor} className="bg-[#0d1322] border border-slate-800 p-6 rounded-2xl max-w-md w-full flex flex-col gap-4 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Register New Tutor Account</h3>
            
            <div className="flex flex-col gap-1 text-xs font-bold text-slate-300">
              <label>Full Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Alan Turing"
                className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none text-slate-200 focus:border-purple-500"
              />
            </div>

            <div className="flex flex-col gap-1 text-xs font-bold text-slate-300">
              <label>Email Address</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tutor@university.edu"
                className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none text-slate-200 focus:border-purple-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-purple-500/20"
              >
                Register Tutor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageTutors;
