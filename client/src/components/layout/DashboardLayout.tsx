import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Users, Building, Calendar, FileText, ClipboardList,
  UserCheck, ShieldAlert, Award, BookOpen, Laptop, HelpCircle, FileCheck,
  Settings, LogOut, Bell, Search, Sun, Moon, Menu, X, ShieldCheck, History,
  Database, Mail, Sliders, ShieldAlert as PoshIcon, BarChart2
} from 'lucide-react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();

  const getSidebarLinks = () => {
    const employeeLinks = [
      { name: 'Dashboard', path: '/employee/dashboard', icon: <LayoutDashboard size={18} /> },
      { name: 'Attendance', path: '/employee/attendance', icon: <Calendar size={18} /> },
      { name: 'Leave Management', path: '/employee/leave', icon: <ClipboardList size={18} /> },
      { name: 'Payslips', path: '/employee/payslips', icon: <FileText size={18} /> },
      { name: 'POSH Complaint', path: '/employee/posh', icon: <PoshIcon size={18} /> },
      { name: 'Profile', path: '/employee/profile', icon: <UserCheck size={18} /> },
      { name: 'Logout', path: '#', icon: <LogOut size={18} />, action: logout }
    ];

    const adminLinks = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
      { name: 'Employees', path: '/admin/employees', icon: <Users size={18} /> },
      { name: 'Departments', path: '/admin/departments', icon: <Building size={18} /> },
      { name: 'Attendance Management', path: '/admin/attendance', icon: <Calendar size={18} /> },
      { name: 'Leave Approvals', path: '/admin/leaves', icon: <ClipboardList size={18} /> },
      { name: 'Payroll Management', path: '/admin/payroll', icon: <FileText size={18} /> },
      { name: 'POSH Management', path: '/admin/posh', icon: <PoshIcon size={18} /> },
      { name: 'Logout', path: '#', icon: <LogOut size={18} />, action: logout }
    ];

    const superAdminLinks = [
      { name: 'Dashboard', path: '/superadmin/dashboard', icon: <LayoutDashboard size={18} /> },
      { name: 'Role Management', path: '/superadmin/roles', icon: <Sliders size={18} /> },
      { name: 'User Management', path: '/superadmin/users', icon: <Users size={18} /> },
      { name: 'Audit Logs', path: '/superadmin/audit-logs', icon: <History size={18} /> },
      { name: 'System Settings', path: '/superadmin/settings', icon: <Settings size={18} /> },
      { name: 'Logout', path: '#', icon: <LogOut size={18} />, action: logout }
    ];

    const icLinks = [
      { name: 'Dashboard', path: '/ic/dashboard', icon: <LayoutDashboard size={18} /> },
      { name: 'All POSH Cases', path: '/ic/cases', icon: <ShieldAlert size={18} /> },
      { name: 'IC Members', path: '/ic/members', icon: <Users size={18} /> },
      { name: 'Logout', path: '#', icon: <LogOut size={18} />, action: logout }
    ];

    switch (role) {
      case 'Employee': return employeeLinks;
      case 'Admin': return adminLinks;
      case 'Super Admin': return superAdminLinks;
      case 'Internal Committee': return icLinks;
      default: return [];
    }
  };

  const links = getSidebarLinks();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((p, i) => {
      const routeTo = '/' + paths.slice(0, i + 1).join('/');
      const name = p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ');
      return { name, routeTo };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans saas-dot-grid">
      
      {/* FLOATING SIDEBAR FOR DESKTOP */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 m-4 mr-0 glass-panel rounded-3xl shrink-0 shadow-lg border border-slate-200/50 dark:border-slate-800/50">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100 dark:border-slate-800/40">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.05 }}
            className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-2xl text-white shadow-md shadow-indigo-600/20"
          >
            <ShieldCheck size={20} />
          </motion.div>
          <div>
            <span className="font-black text-slate-800 dark:text-white tracking-tight text-sm block">Enterprise Portal</span>
            <span className="text-[10px] block font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider leading-none mt-0.5">HRMS & POSH</span>
          </div>
        </div>

        {/* User profile capsule with avatar interaction */}
        <div className="p-4 mx-3 my-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/30 flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black text-md border border-white shadow-md shadow-indigo-500/10 cursor-pointer shrink-0"
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </motion.div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">
              {user?.employeeProfile ? `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}` : 'System Admin'}
            </h4>
            <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[9px] font-black uppercase mt-1 tracking-wider border border-indigo-150/30">
              {role}
            </span>
          </div>
        </div>

        {/* Navigation links with slide effect active indicator */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {links.map((link, idx) => {
            const isActive = location.pathname === link.path;
            
            if (link.action) {
              return (
                <motion.button
                  key={idx}
                  onClick={link.action}
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold text-rose-600 dark:text-rose-450 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                >
                  <span className="text-rose-500">{link.icon}</span>
                  <span>{link.name}</span>
                </motion.button>
              );
            }
            return (
              <Link
                key={idx}
                to={link.path}
                className="block relative"
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/15'
                      : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>{link.icon}</span>
                  <span>{link.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative flex flex-col w-64 bg-white dark:bg-slate-900 h-full border-r border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 dark:border-slate-800">
                <span className="font-black text-slate-800 dark:text-white text-sm">HRMS Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {links.map((link, idx) => {
                  const isActive = location.pathname === link.path;
                  return link.action ? (
                    <button
                      key={idx}
                      onClick={() => { setMobileMenuOpen(false); link.action(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </button>
                  ) : (
                    <Link
                      key={idx}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100'
                      }`}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* HEADER BAR (GLASSY) */}
        <header className="h-16 m-4 mb-0 glass-panel rounded-3xl flex items-center justify-between px-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-550 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumbs for desktop with transitions */}
            <nav className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span className="hover:text-indigo-650 cursor-pointer">HRMS</span>
              {breadcrumbs.map((bc, idx) => (
                <React.Fragment key={idx}>
                  <span>/</span>
                  <span className={idx === breadcrumbs.length - 1 ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'hover:text-slate-655'}>
                    {bc.name}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {/* Notifications Dropdown with Wiggling bell */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-colors relative cursor-pointer"
              >
                <motion.div
                  animate={notificationsOpen ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Bell size={18} />
                </motion.div>
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
              </motion.button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700/50 z-50 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/30 flex justify-between items-center bg-slate-50/50 dark:bg-slate-750/30">
                        <span className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Updates</span>
                        <button className="text-[10px] font-bold text-indigo-600 hover:underline dark:text-indigo-400">Clear All</button>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/30">
                        <div className="p-3.5 text-xs text-slate-600 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-700/20 cursor-pointer">
                          <p className="font-bold text-slate-800 dark:text-white">Payroll Processed</p>
                          <p className="mt-0.5 text-slate-500">Your monthly payroll details for July 2026 are processed.</p>
                          <span className="text-[9px] font-bold text-slate-400 block mt-1.5">2 hours ago</span>
                        </div>
                        <div className="p-3.5 text-xs text-slate-600 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-700/20 cursor-pointer">
                          <p className="font-bold text-slate-800 dark:text-white">Policy Documents</p>
                          <p className="mt-0.5 text-slate-500">The updated compliance and code of conduct statement is online.</p>
                          <span className="text-[9px] font-bold text-slate-400 block mt-1.5">1 day ago</span>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-650 to-indigo-500 text-white font-extrabold flex items-center justify-center text-sm border border-slate-200/10 shadow-md shadow-indigo-600/10">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </motion.button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700/50 z-50 py-1 overflow-hidden animate-fade-in"
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/30">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account</p>
                        <p className="text-xs font-black text-slate-800 dark:text-white truncate mt-0.5">{user?.email}</p>
                      </div>
                      <Link
                        to={role === 'Employee' ? '/employee/profile' : '#'}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      >
                        <UserCheck size={14} className="text-slate-400" />
                        <span>My Profile</span>
                      </Link>
                      <button
                        onClick={() => { setUserDropdownOpen(false); logout(); }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-455 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                      >
                        <LogOut size={14} className="text-rose-550" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/40">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

