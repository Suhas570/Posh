import React from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { CATEGORIES, STATUSES } from '../../utils/constants';

const CourseFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode
}) => {
  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200/50 p-4 rounded-[20px] shadow-premium mb-6 text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search courses by title or instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-semibold py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200/50 rounded-[14px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder-slate-400"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs font-semibold py-2 px-3 bg-slate-50 border border-slate-200/50 rounded-[14px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 cursor-pointer"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs font-semibold py-2 px-3 bg-slate-50 border border-slate-200/50 rounded-[14px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 cursor-pointer"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold py-2 px-3 bg-slate-50 border border-slate-200/50 rounded-[14px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="title">Title (A-Z)</option>
              <option value="duration">Duration</option>
            </select>
          </div>

          {/* View switcher */}
          <div className="w-[1px] h-6 bg-slate-200 hidden sm:block" />
          
          <div className="flex items-center gap-1 bg-[#f8fafc] border border-slate-200/50 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-all focus:outline-none cursor-pointer
                ${viewMode === 'card' 
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              title="Card View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all focus:outline-none cursor-pointer
                ${viewMode === 'table' 
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseFilters;
