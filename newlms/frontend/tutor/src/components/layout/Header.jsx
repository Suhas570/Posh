import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, ChevronDown, LogOut } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-20 bg-white/75 backdrop-blur-md border-b border-slate-200/40 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30 transition-all duration-300">
      {/* Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search anything... (⌘ K)"
            className="w-full text-[11px] font-semibold py-2.5 pl-10 pr-4 bg-slate-50/50 border border-slate-200/50 rounded-[14px] focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all placeholder-slate-400"
          />
        </div>
      </div>

      <div className="md:hidden flex items-center gap-2">
        <span className="text-sm font-bold text-slate-800 tracking-tight">Tutor LMS</span>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2.5 rounded-xl border border-slate-200/50 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-600 rounded-full border border-white" />
        </button>

        {/* Vertical Divider */}
        <div className="w-[1px] h-8 bg-slate-200/60" />

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'}
            alt={user?.name || 'Tutor'}
            className="w-9 h-9 rounded-full object-cover border border-slate-200/60 transition-transform group-hover:scale-105"
          />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-brand-600 transition-colors">
              {user?.name || 'Tutor'}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase leading-tight">
              {user?.role || 'Tutor Role'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Logout"
          className="p-2.5 rounded-xl border border-slate-200/50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
