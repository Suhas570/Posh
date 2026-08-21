import React, { useEffect, useState } from 'react';
import { FolderOpen, Search, Video, FileText, Presentation, ExternalLink, Download, Trash2, ShieldAlert } from 'lucide-react';
import { adminService } from '../../services/adminService';
import apiClient from '../../api/client';

const ManageResources = () => {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const res = await apiClient.get('/api/admin/resources');
      setResources(res.data);
    } catch (e) {
      setResources([]);
    }
  };

  const handleDeleteResource = async (resItem) => {
    if (!confirm(`Are you sure you want to delete "${resItem.name}"? This file will be removed across all portals.`)) return;
    try {
      await apiClient.delete('/api/admin/resources', {
        data: { courseId: resItem.courseId, lessonId: resItem.lessonId, fileType: resItem.type }
      });
      setResources(prev => prev.filter(r => r.id !== resItem.id));
    } catch (e) {}
  };

  const filtered = resources.filter(r => {
    const matchesType = filterType === 'ALL' || r.type === filterType;
    const matchesSearch = (r.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (r.courseTitle || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.instructor || '').toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Central Resource & Media Vault</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Complete Super Admin visibility into uploaded Videos, PDFs, PPTs, and Learning Materials.</p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'VIDEO', 'PDF', 'PPT'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-800 text-slate-400 text-xs max-w-md">
        <Search size={16} />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter resources by name, course, or tutor..."
          className="bg-transparent border-none outline-none text-slate-200 text-xs w-full"
        />
      </div>

      {/* Resources Table */}
      <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Resource File</th>
              <th className="p-4">Type</th>
              <th className="p-4">Course & Lesson</th>
              <th className="p-4">Tutor</th>
              <th className="p-4">Size</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {filtered.map(resItem => (
              <tr key={resItem.id} className="hover:bg-slate-900/40 transition-all">
                <td className="p-4 flex items-center gap-3 font-extrabold text-white">
                  {resItem.type === 'VIDEO' ? <Video size={16} className="text-indigo-400 shrink-0" /> :
                   resItem.type === 'PDF' ? <FileText size={16} className="text-blue-400 shrink-0" /> :
                   <Presentation size={16} className="text-emerald-400 shrink-0" />}
                  <span className="line-clamp-1">{resItem.name}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    resItem.type === 'VIDEO' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                    resItem.type === 'PDF' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {resItem.type}
                  </span>
                </td>
                <td className="p-4 flex flex-col">
                  <span className="text-slate-200 font-bold line-clamp-1">{resItem.courseTitle}</span>
                  <span className="text-slate-500 text-[10px]">{resItem.moduleTitle}</span>
                </td>
                <td className="p-4 text-slate-300 font-semibold">{resItem.instructor}</td>
                <td className="p-4 text-slate-400 text-[11px] font-mono">{resItem.size}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={resItem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition-all cursor-pointer"
                      title="Open / Download Resource"
                    >
                      <Download size={14} />
                    </a>
                    <button
                      onClick={() => handleDeleteResource(resItem)}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all cursor-pointer"
                      title="Delete Resource across platform"
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

export default ManageResources;
