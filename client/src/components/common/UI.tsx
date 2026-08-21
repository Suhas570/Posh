import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Status Badges
interface BadgeProps {
  status: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  const getColors = (val: string) => {
    const s = val.toLowerCase();
    if (s === 'new' || s === 'pending') {
      return 'bg-indigo-50 text-indigo-750 border border-indigo-200/50 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30';
    }
    if (s === 'under review' || s === 'assigned' || s === 'enrolled') {
      return 'bg-purple-50 text-purple-750 border border-purple-200/50 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/30';
    }
    if (s === 'investigation' || s === 'in progress') {
      return 'bg-amber-50 text-amber-755 border border-amber-200/50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30';
    }
    if (s === 'resolved' || s === 'approved' || s === 'completed' || s === 'paid' || s === 'present' || s === 'complaint substantiated') {
      return 'bg-emerald-50 text-emerald-755 border border-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30';
    }
    if (s === 'closed') {
      return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/50';
    }
    if (s === 'rejected' || s === 'absent' || s === 'suspended' || s === 'false complaint') {
      return 'bg-rose-50 text-rose-755 border border-rose-200/50 dark:bg-rose-950/40 dark:text-rose-450 dark:border-rose-900/30';
    }
    if (s === 'insufficient evidence' || s === 'complaint not substantiated' || s === 'late' || s === 'half-day') {
      return 'bg-orange-50 text-orange-755 border border-orange-200/50 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/30';
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getColors(status)}`}>
      {status}
    </span>
  );
};

// Skeletons
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`}></div>
  );
};

// FadeInPage Entrance wrapper
export const FadeInPage: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Premium Floating Card Wrapper
export const FloatingPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Premium Button with micro-interactions
export const PremiumButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const getStyles = () => {
    switch (variant) {
      case 'primary': return 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-500/20';
      case 'secondary': return 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';
      case 'accent': return 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-500/20';
      case 'danger': return 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20';
      case 'ghost': return 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300';
    }
  };
  const { onDrag, onDragStart, onDragEnd, ...cleanProps } = props as any;
  return (
    <motion.button
      whileHover={{ scale: 1.025, y: -1 }}
      whileTap={{ scale: 0.975 }}
      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${getStyles()} ${className}`}
      {...cleanProps}
    >
      {children}
    </motion.button>
  );
};

// Redesigned Stats Cards with hover lift, glow shadow, and gradient icon wrappers
interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<CardProps> = ({ title, value, icon, description, trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-xl hover:border-indigo-100/50 transition-all relative overflow-hidden group"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">{title}</p>
          <h3 className="text-3xl font-black mt-2 text-slate-900 dark:text-white tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      
      {(trend || description) && (
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-50 dark:border-slate-700/30">
          {trend && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${trend.isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
          {description && (
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">{description}</span>
          )}
        </div>
      )}
      
      {/* Decorative gradient light corner */}
      <span className="absolute -right-16 -bottom-16 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></span>
    </motion.div>
  );
};

// Premium Modal dialog using AnimatePresence and Zoom entrance
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'danger' | 'info';
}

export const ConfirmDialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  type = 'info'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-md font-extrabold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{message}</p>
            </div>
            <div className="flex justify-end gap-2.5 px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700/50">
              <PremiumButton variant="secondary" onClick={onClose}>
                Cancel
              </PremiumButton>
              <PremiumButton
                variant={type === 'danger' ? 'danger' : 'primary'}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmText}
              </PremiumButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Redesigned SVG charts with entrance load animations
interface PieChartProps {
  data: { name: string; value: number; color: string }[];
  size?: number;
}

export const SVGPieChart: React.FC<PieChartProps> = ({ data, size = 160 }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 justify-center p-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90">
          {total === 0 ? (
            <circle cx="16" cy="16" r="14" fill="transparent" stroke="#e2e8f0" strokeWidth="4" />
          ) : (
            data.map((item, idx) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = 100 - accumulatedAngle;
              accumulatedAngle += percentage;

              return (
                <motion.circle
                  key={idx}
                  cx="16"
                  cy="16"
                  r="14"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="4"
                  strokeDasharray={strokeDasharray}
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: strokeDashoffset }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                  className="transition-all duration-300 hover:stroke-[4.8px] cursor-pointer"
                />
              );
            })
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-full m-[13%] border border-slate-100 dark:border-slate-700/50 shadow-inner">
          <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{total}</span>
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Total Cases</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-2.5">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
            <span>{item.name}:</span>
            <span className="font-bold text-slate-800 dark:text-white">{item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Bar Chart with spring dynamic load height
interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

export const SVGBarChart: React.FC<BarChartProps> = ({ data, height = 150, color = 'bg-indigo-600 dark:bg-indigo-500' }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex flex-col justify-end w-full" style={{ height: height + 50 }}>
      <div className="flex items-end justify-between gap-4 h-full px-2 border-b border-slate-200 dark:border-slate-700">
        {data.map((item, idx) => {
          const heightPercent = (item.value / maxValue) * 100;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip */}
              <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10">
                {item.value}
              </div>
              {/* Animated Bar */}
              <motion.div
                initial={{ height: '0%' }}
                animate={{ height: `${heightPercent || 5}%` }}
                transition={{ type: 'spring', damping: 15, delay: idx * 0.05 }}
                className={`w-full rounded-t-lg transition-all duration-300 hover:opacity-85 ${color} shadow-lg shadow-indigo-500/10`}
              ></motion.div>
              {/* Label */}
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2.5 truncate w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
