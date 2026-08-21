import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from './Button';

const PageHeader = ({
  title,
  subtitle,
  actions,
  backUrl,
  className = '',
}) => {
  const navigate = useNavigate();

  const getAccentColor = (titleText) => {
    const text = (titleText || '').toLowerCase();
    if (text.includes('dashboard') || text.includes('morning') || text.includes('welcome')) return 'text-indigo-600';
    if (text.includes('courses') || text.includes('course')) return 'text-blue-600';
    if (text.includes('analytics') || text.includes('performance')) return 'text-cyan-600';
    if (text.includes('content') || text.includes('library') || text.includes('repository')) return 'text-emerald-600';
    if (text.includes('message') || text.includes('inbox') || text.includes('conversations')) return 'text-purple-600';
    if (text.includes('calendar') || text.includes('schedule') || text.includes('scheduling')) return 'text-orange-600';
    if (text.includes('announcement') || text.includes('broadcast')) return 'text-pink-600';
    if (text.includes('review') || text.includes('reviews') || text.includes('rating')) return 'text-amber-500';
    if (text.includes('settings') || text.includes('account') || text.includes('system')) return 'text-slate-600';
    return 'text-slate-900';
  };

  const accentClass = getAccentColor(title);

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/50 mb-6 ${className}`}>
      <div className="flex items-center gap-3">
        {backUrl && (
          <Button
            variant="icon"
            onClick={() => navigate(backUrl)}
            className="rounded-xl border-slate-200"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </Button>
        )}
        <div>
          <h1 className={`text-xl font-black tracking-tight ${accentClass}`}>{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 self-start md:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
