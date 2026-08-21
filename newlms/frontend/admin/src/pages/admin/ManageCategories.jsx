import React, { useEffect, useState } from 'react';
import { Layers, Plus, Tag, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await adminService.getCategories();
    setCategories(data);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const cat = await adminService.addCategory(newCategory);
    setCategories(prev => [...prev, cat]);
    setNewCategory('');
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category taxonomy?')) return;
    await adminService.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-black tracking-tight text-white">Course Categories & Taxonomies</h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Super Admin platform course classification categories synchronized with backend.</p>
      </div>

      {/* Category Creation Form */}
      <form onSubmit={handleAddCategory} className="flex gap-3 bg-[#0d1322] border border-slate-800 p-4 rounded-2xl max-w-xl">
        <input 
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Enter new category name (e.g. Data Science)..."
          className="flex-1 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-200 outline-none focus:border-purple-500"
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-purple-500/20"
        >
          <Plus size={14} /> Add Category
        </button>
      </form>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-[#0d1322] border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <Tag size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-white">{cat.name}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{cat.count || 0} Active Courses</span>
              </div>
            </div>

            <button
              onClick={() => handleDeleteCategory(cat.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-all cursor-pointer"
              title="Delete Category"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageCategories;
