import React from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trendText,
  trendDirection = 'up', // up, down, flat
  colorClass = 'brand', // brand, green, amber, blue, rose, purple, indigo
}) => {
  const cardGradientMap = {
    brand: 'bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/40 border-indigo-100/70 shadow-sm shadow-indigo-500/5',
    green: 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 border-emerald-100/70 shadow-sm shadow-emerald-500/5',
    amber: 'bg-gradient-to-br from-orange-50/80 via-white to-orange-50/40 border-orange-100/70 shadow-sm shadow-orange-500/5',
    blue: 'bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 border-blue-100/70 shadow-sm shadow-blue-500/5',
    rose: 'bg-gradient-to-br from-rose-50/80 via-white to-rose-50/40 border-rose-100/70 shadow-sm shadow-rose-500/5',
    purple: 'bg-gradient-to-br from-purple-50/80 via-white to-purple-50/40 border-purple-100/70 shadow-sm shadow-purple-500/5',
    indigo: 'bg-gradient-to-br from-cyan-50/80 via-white to-cyan-50/40 border-cyan-100/70 shadow-sm shadow-cyan-500/5',
  };

  const iconColorMap = {
    brand: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/20',
    green: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/20',
    amber: 'bg-orange-500/10 text-orange-600 border-orange-200/20',
    blue: 'bg-blue-500/10 text-blue-600 border-blue-200/20',
    rose: 'bg-rose-500/10 text-rose-600 border-rose-200/20',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-200/20',
    indigo: 'bg-cyan-500/10 text-cyan-600 border-cyan-200/20',
  };

  const barColorMap = {
    brand: 'bg-indigo-500',
    green: 'bg-emerald-500',
    amber: 'bg-orange-500',
    blue: 'bg-blue-500',
    rose: 'bg-rose-500',
    purple: 'bg-purple-500',
    indigo: 'bg-cyan-500',
  };

  const trendColor = trendDirection === 'up' 
    ? 'text-emerald-600' 
    : trendDirection === 'down' 
      ? 'text-red-500' 
      : 'text-slate-400';

  const trendIcon = trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '→';

  return (
    <Card hoverEffect className={`p-4 flex flex-col gap-3 justify-between ${cardGradientMap[colorClass] || cardGradientMap.brand}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <motion.h3 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="text-xl font-extrabold text-slate-800 tracking-tight"
          >
            {value}
          </motion.h3>
        </div>
        
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 3 }}
          className={`p-2.5 rounded-xl border flex-shrink-0 ${iconColorMap[colorClass] || iconColorMap.brand}`}
        >
          <Icon size={16} />
        </motion.div>
      </div>

      {/* Progress Indicator */}
      <div className="w-full bg-slate-100/60 h-1 rounded-full overflow-hidden mt-1 select-none">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '65%' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-full rounded-full ${barColorMap[colorClass] || barColorMap.brand}`}
        />
      </div>
      
      {trendText && (
        <div className="flex items-center gap-1 text-[10px] font-bold mt-1">
          <span className={trendColor}>{trendIcon} {trendText}</span>
          <span className="text-slate-400 font-medium">from last month</span>
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
