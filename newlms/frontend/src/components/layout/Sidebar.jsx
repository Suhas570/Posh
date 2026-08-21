import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileCheck, 
  Settings as SettingsIcon, 
  ChevronLeft, 
  ChevronRight, 
  Crown,
  BookOpenCheck,
  BarChart3,
  FolderOpen,
  Star,
  Megaphone,
  Calendar,
  MessageSquare
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Content Library', path: '/content-library', icon: FolderOpen },
    { name: 'Course Reviews', path: '/reviews', icon: Star },
    { name: 'Announcements', path: '/announcements', icon: Megaphone },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Assignments', path: '/assignments', icon: FileCheck },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="fixed left-0 top-0 h-screen glass-panel border-r border-slate-200/50 flex flex-col justify-between z-40"
    >
      {/* Top Logo Section */}
      <div>
        <div className="flex items-center justify-between px-5 h-20 border-b border-slate-200/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600 flex-shrink-0">
              <BookOpenCheck size={20} />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-sm font-black text-slate-900 tracking-tight whitespace-nowrap">Tutor LMS</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Workspace</span>
              </motion.div>
            )}
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg border border-slate-200/60 text-slate-400 hover:text-slate-600 hover:bg-slate-50/50 transition-all focus:outline-none"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3.5 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-230px)] scrollbar-thin">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-xs font-extrabold select-none
                ${isActive 
                  ? 'text-brand-600' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-brand-500/5 border border-brand-500/10 rounded-xl"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex-shrink-0"
                  >
                    <item.icon size={18} className={isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'} />
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

      {/* Bottom Promo & Storage Cards */}
      <div className="p-4 flex flex-col gap-4 border-t border-slate-100/50 overflow-hidden">
        {/* Storage Card */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
            {!isCollapsed && <span>Storage</span>}
            <span className={isCollapsed ? 'mx-auto text-[9px]' : ''}>85% Used</span>
          </div>
          
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-brand-500 h-full rounded-full" style={{ width: '85%' }} />
          </div>
          
          {!isCollapsed && (
            <span className="text-[10px] text-slate-400 font-semibold">17.2 GB / 20 GB</span>
          )}
        </div>

        {/* Go Premium Promo */}
        {!isCollapsed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-[#fdfaf2] rounded-2xl border border-[#ebdcb9]/60 flex flex-col gap-3 relative"
          >
            <div className="absolute top-3 right-3 text-amber-600 bg-[#faf4e5] p-1.5 rounded-lg">
              <Crown size={12} />
            </div>
            
            <div className="flex flex-col gap-1">
              <h4 className="text-xs font-bold text-slate-800">Go Premium</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-[150px]">
                Unlock premium tools and extend cloud storage size.
              </p>
            </div>
            
            <button
              onClick={() => alert('Premium Billing Portal Mockup')}
              className="w-full py-2 px-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm shadow-brand-500/10"
            >
              Upgrade Now
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => alert('Premium Billing Portal Mockup')}
            className="p-2.5 bg-brand-50 rounded-xl text-brand-600 hover:bg-brand-100 mx-auto transition-all border border-brand-100/30"
          >
            <Crown size={16} />
          </button>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
