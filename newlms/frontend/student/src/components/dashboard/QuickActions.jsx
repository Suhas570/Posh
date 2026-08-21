import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Video, FileText, ArrowRight } from 'lucide-react';
import Card from '../common/Card';

const QuickActions = ({ onUploadVideo, onUploadNotes }) => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Add Course',
      desc: 'Create basic info, details, status & upload media.',
      icon: Plus,
      color: 'bg-brand-50 text-brand-600 border-brand-100/50',
      action: () => navigate('/courses/add')
    },
    {
      title: 'Upload Video',
      desc: 'Add YouTube, animated, or pre-recorded URL videos.',
      icon: Video,
      color: 'bg-blue-50 text-blue-600 border-blue-100/50',
      action: onUploadVideo
    },
    {
      title: 'Upload Notes',
      desc: 'Link PDF lecture sheets and description URLs.',
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100/50',
      action: onUploadNotes
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((act, index) => (
        <Card
          key={index}
          onClick={act.action}
          className="p-5 flex items-start justify-between cursor-pointer group"
        >
          <div className="flex gap-4">
            <div className={`p-3 rounded-2xl border ${act.color} flex-shrink-0`}>
              <act.icon size={20} />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                {act.title}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-[200px]">
                {act.desc}
              </p>
            </div>
          </div>
          <div className="text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all">
            <ArrowRight size={16} />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default QuickActions;
