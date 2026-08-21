import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, Edit3, Send, Users, UserCheck, GraduationCap } from 'lucide-react';
import apiClient from '../../api/client';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [target, setTarget] = useState('ALL');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const res = await apiClient.get('/api/admin/announcements');
      setAnnouncements(res.data);
    } catch (e) {
      setAnnouncements([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;

    try {
      const res = await apiClient.post('/api/admin/announcements', {
        title,
        text,
        target
      });
      setAnnouncements(prev => [res.data, ...prev]);
      setTitle('');
      setText('');
      setTarget('ALL');
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this broadcast announcement?')) return;
    try {
      await apiClient.delete(`/api/admin/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (e) {}
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-black tracking-tight text-white">Broadcast Announcement Center</h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Super Admin platform announcements synchronized in real-time across Student and Tutor portals.</p>
      </div>

      {/* Broadcast Creation Form */}
      <form onSubmit={handleCreate} className="bg-[#0d1322] border border-slate-800 p-5 rounded-2xl flex flex-col gap-4 max-w-2xl shadow-xl">
        <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
          <Megaphone size={16} /> Broadcast New Announcement
        </h3>

        <div className="flex flex-col gap-1 text-xs font-bold text-slate-300">
          <label>Announcement Title</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. System Maintenance or Final Exam Schedule..."
            className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none text-slate-200 focus:border-purple-500"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1 text-xs font-bold text-slate-300">
            <label>Target Audience</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none text-slate-200 focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">All Users (Students & Tutors)</option>
              <option value="STUDENTS">Students Only</option>
              <option value="TUTORS">Tutors Only</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs font-bold text-slate-300">
          <label>Announcement Message</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Write announcement details..."
            className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none text-slate-200 focus:border-purple-500"
          />
        </div>

        <button
          type="submit"
          className="self-end px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-purple-500/20"
        >
          <Send size={14} /> Send Broadcast
        </button>
      </form>

      {/* Broadcast History */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Broadcast History & Log</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-[#0d1322] border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-lg">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    Target: {ann.target}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">{ann.date}</span>
                </div>
                <h4 className="text-sm font-extrabold text-white mt-1">{ann.title}</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{ann.text || ann.content}</p>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all cursor-pointer"
                  title="Delete Announcement"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
