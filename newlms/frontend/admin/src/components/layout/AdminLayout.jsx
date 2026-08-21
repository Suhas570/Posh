import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Layers, 
  Megaphone, 
  Settings as SettingsIcon, 
  BarChart3, 
  ShieldCheck, 
  Bell, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  FolderOpen,
  MessageSquare,
  LogOut
} from 'lucide-react';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Tutor Pipeline', path: '/admin/tutors', icon: Users },
    { name: 'Course Moderation', path: '/admin/courses', icon: BookOpen },
    { name: 'Resource Vault', path: '/admin/resources', icon: FolderOpen },
    { name: 'Tutor Inbox', path: '/admin/messages', icon: MessageSquare },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Certificates', path: '/admin/certificates', icon: ShieldCheck },
    { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { name: 'Analytics & Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Platform Settings', path: '/admin/settings', icon: SettingsIcon }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex font-sans">
      {/* Super Admin Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? '76px' : '260px' }}
        transition={{ duration: 0.2 }}
        className="fixed top-0 left-0 bottom-0 bg-[#0d1322] border-r border-slate-800/80 z-40 flex flex-col justify-between overflow-hidden shadow-2xl"
      >
        <div>
          {/* Logo & Super Admin Badge */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/20">
                <Shield size={20} />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black tracking-tight text-white">ENTERPRISE LMS</span>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Super Admin</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 flex flex-col gap-1 text-left">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-md shadow-purple-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <item.icon size={18} className="shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* System Health & Logout Footer */}
        <div className="p-3 border-t border-slate-800/80 flex flex-col gap-2">
          {!isCollapsed ? (
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-3 text-left">
              <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-300">System Status</span>
                <span className="text-[9px] font-semibold text-emerald-400">100% Operational</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={16} />
            </div>
          )}
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
            title="Log out"
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Pane */}
      <div 
        className="flex-1 min-h-screen flex flex-col transition-all duration-200"
        style={{ marginLeft: isCollapsed ? '76px' : '260px' }}
      >
        {/* Top Header */}
        <header className="h-16 bg-[#0d1322]/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/80 text-slate-400 text-xs w-72">
            <Search size={14} />
            <input 
              type="text" 
              placeholder="Search platform resources, users, courses..."
              className="bg-transparent border-none outline-none text-slate-200 text-xs w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <img 
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120'}
                alt="Admin Avatar" 
                className="w-8 h-8 rounded-full border border-purple-500/40 object-cover"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-200">{user?.name || 'Super Admin'}</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">{user?.email || 'admin@lms.com'}</span>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
