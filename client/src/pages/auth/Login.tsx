import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Building, UserCheck, Calendar, DollarSign, ArrowRight, UserCog, Users, Shield, User } from 'lucide-react';
import { PremiumButton } from '../../components/common/UI';
import { UserRole } from '../../types';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Employee');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: any) => {
    setSubmitLoading(true);
    try {
      // Pass the selected role to the login function
      await login(data.email, data.password, selectedRole);
      showToast('Login successful! Redirecting...', 'success');
      
      // Navigate to the correct dashboard based on the selected role
      if (selectedRole === 'Employee') navigate('/employee/dashboard');
      else if (selectedRole === 'Admin') navigate('/admin/dashboard');
      else if (selectedRole === 'Super Admin') navigate('/superadmin/dashboard');
      else if (selectedRole === 'Internal Committee') navigate('/ic/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Invalid email or password', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const fillCredentials = (role: string) => {
    if (role === 'employee') {
      setValue('email', 'employee@hrms.com');
      setValue('password', 'password');
      setSelectedRole('Employee');
    } else if (role === 'admin') {
      setValue('email', 'admin@hrms.com');
      setValue('password', 'password');
      setSelectedRole('Admin');
    } else if (role === 'superadmin') {
      setValue('email', 'superadmin@hrms.com');
      setValue('password', 'password');
      setSelectedRole('Super Admin');
    } else if (role === 'ic') {
      setValue('email', 'ic@hrms.com');
      setValue('password', 'password');
      setSelectedRole('Internal Committee');
    }
  };

  const roleOptions: { role: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    { role: 'Employee', label: 'Employee', icon: <User size={14} />, desc: 'Self-service portal' },
    { role: 'Admin', label: 'Admin', icon: <Users size={14} />, desc: 'HR management' },
    { role: 'Super Admin', label: 'Super Admin', icon: <UserCog size={14} />, desc: 'System control' },
    { role: 'Internal Committee', label: 'IC Committee', icon: <Shield size={14} />, desc: 'POSH cases' }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden select-none">
      
      {/* Left side: Premium Animated Graphics */}
      <div className="hidden lg:flex lg:w-1/2 relative gradient-primary-bg justify-center items-center overflow-hidden p-12">
        {/* Animated background canvas lights */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-400/20 blur-3xl rounded-full"
        />
        
        {/* Dot grid decoration */}
        <div className="absolute inset-0 saas-dot-grid opacity-30" />

        {/* Floating Icons illustration container */}
        <div className="relative z-10 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full w-fit border border-white/10"
          >
            <ShieldCheck size={20} className="text-white animate-pulse" />
            <span className="text-xs font-black tracking-widest uppercase">POSH Compliant Enterprise Portal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl font-black tracking-tight leading-[1.1] mb-6"
          >
            Redefining <br/>Human Resource <br/>Management.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/80 text-sm font-semibold leading-relaxed mb-10"
          >
            Secure compliance reporting, automated attendance mapping, real-time leaves approval flow, and high-performance POSH grievance management.
          </motion.p>

          {/* Grid layout of floating mock dashboard elements */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Interactive Dashboards', icon: <Building size={16} />, delay: 0.3 },
              { label: 'POSH Security Shield', icon: <ShieldCheck size={16} />, delay: 0.4 },
              { label: 'Leaves & Workflows', icon: <Calendar size={16} />, delay: 0.5 },
              { label: 'Audited Payroll Engine', icon: <DollarSign size={16} />, delay: 0.6 }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.5, delay: item.delay }}
                className="p-4 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg flex items-center gap-3"
              >
                <div className="p-2.5 bg-white/10 rounded-xl text-white">
                  {item.icon}
                </div>
                <span className="text-xs font-extrabold">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-slate-50 dark:bg-slate-900 saas-dot-grid">
        
        {/* Floating background circle */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-purple-500/5 dark:bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10"
        >
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-tr from-indigo-650 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <ShieldCheck size={28} />
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-900 dark:text-white tracking-tight">Enterprise HRMS</h2>
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Enter credentials to access portal
            </p>
          </div>

          {/* Quick Fills for Demo */}
          <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/40">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2.5">Demo Quick Accounts</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Employee', role: 'employee' },
                { name: 'Admin Portal', role: 'admin' },
                { name: 'Super Admin', role: 'superadmin' },
                { name: 'IC Committee', role: 'ic' }
              ].map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => fillCredentials(act.role)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-indigo-300 transition-all shadow-sm cursor-pointer"
                >
                  {act.name}
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              
              {/* Email */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/, message: 'Invalid email address' }
                    })}
                    className="pl-10 w-full px-4 py-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
                {errors.email && <span className="text-rose-500 text-[10px] font-bold mt-1 block">{errors.email.message}</span>}
              </div>

              {/* Password */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })}
                    className="pl-10 pr-10 w-full px-4 py-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="text-rose-500 text-[10px] font-bold mt-1 block">{errors.password.message}</span>}
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">Select Portal / Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map((opt) => (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => setSelectedRole(opt.role)}
                      className={`px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRole === opt.role
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-[10px] font-black">
                        {opt.icon}
                        {opt.label}
                      </span>
                      <span className={`block text-[9px] font-semibold mt-0.5 ${selectedRole === opt.role ? 'text-white/70' : 'text-slate-400'}`}>
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold">
              <label className="flex items-center text-slate-450 dark:text-slate-500 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 mr-2" />
                Remember Device
              </label>
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Forgot password?</a>
            </div>

            {/* Submit */}
            <PremiumButton
              type="submit"
              disabled={submitLoading}
              className="w-full py-3"
            >
              {submitLoading ? (
                <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="flex items-center gap-1.5 justify-center">
                  Sign In as {selectedRole} <ArrowRight size={14} />
                </span>
              )}
            </PremiumButton>
          </form>
        </motion.div>
      </div>

    </div>
  );
};

export default Login;