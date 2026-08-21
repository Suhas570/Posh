import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpenCheck, 
  BookOpen, 
  Megaphone, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Bell, 
  User, 
  Settings as SettingsIcon, 
  FileCheck, 
  Award,
  ChevronLeft,
  ChevronRight,
  BookOpen as LogoIcon,
  Search,
  LogOut
} from 'lucide-react';

const StudentLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Learning', path: '/student/my-learning', icon: BookOpenCheck },
    { name: 'Browse Courses', path: '/student/browse', icon: BookOpen },
    { name: 'Assignments', path: '/student/assignments', icon: FileCheck },
    { name: 'Announcements', path: '/student/announcements', icon: Megaphone },
    { name: 'Calendar', path: '/student/calendar', icon: Calendar },
    { name: 'Messages', path: '/student/messages', icon: MessageSquare },
    { name: 'Certificates', path: '/student/certificates', icon: Award },
    { name: 'Progress', path: '/student/progress', icon: TrendingUp },
    { name: 'Notifications', path: '/student/notifications', icon: Bell },
    { name: 'Profile', path: '/student/profile', icon: User },
    { name: 'Settings', path: '/student/settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] saas-dot-grid flex text-left font-sans antialiased text-slate-800">
      
      {/* Student Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 76 : 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="fixed left-0 top-0 h-screen glass-panel border-r border-slate-200/50 flex flex-col justify-between z-40"
      >
        <div>
          {/* Sidebar Brand header */}
          <div className="flex items-center justify-between px-5 h-20 border-b border-slate-200/40">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 flex-shrink-0">
                <LogoIcon size={20} />
              </div>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col"
                >
                  <span className="text-sm font-black text-slate-900 tracking-tight whitespace-nowrap">Student Hub</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Workspace</span>
                </motion.div>
              )}
            </div>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg border border-slate-200/60 text-slate-400 hover:text-slate-600 hover:bg-slate-50/50 transition-all focus:outline-none cursor-pointer"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Student Sidebar nav items */}
          <nav className="p-3.5 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-xs font-extrabold select-none
                  ${isActive 
                    ? 'text-indigo-600 font-black' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div 
                        layoutId="studentActiveIndicator"
                        className="absolute inset-0 bg-indigo-500/5 border border-indigo-500/10 rounded-xl"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="flex-shrink-0"
                    >
                      <item.icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
                    </motion.div>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-16 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap shadow-md">
                        {item.name}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Exit back to Tutor dashboard switcher at bottom */}
        <div className="p-4 border-t border-slate-200/40">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all font-bold text-xs cursor-pointer"
          >
            <LogOut size={16} className="text-slate-400" />
            {!isCollapsed && <span>Tutor Panel</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main content pane */}
      <div 
        className="flex-1 min-h-screen flex flex-col transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '76px' : '260px' }}
      >
        {/* Student Glass Header */}
        <header className="h-20 bg-white/75 backdrop-blur-md border-b border-slate-200/40 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30 transition-all duration-300">
          {/* Header search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search courses, lessons or stats..."
                className="w-full text-[11px] font-semibold py-2.5 pl-10 pr-4 bg-[#fbf9f3]/50 border border-slate-200/50 rounded-[14px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder-slate-400"
              />
            </div>
          </div>

          {/* Student profile preview badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80" 
                alt="Profile Avatar" 
                className="w-8 h-8 rounded-full border border-slate-200/60 object-cover"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight">Manoj</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Student Role</span>
              </div>
            </div>
          </div>
        </header>

        {/* Route container viewport */}
        <main className="flex-grow p-6 md:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default StudentLayout;
