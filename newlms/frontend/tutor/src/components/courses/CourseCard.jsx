import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  FileText, 
  Link, 
  Folder, 
  Clock, 
  User, 
  Edit3, 
  Trash2, 
  Eye 
} from 'lucide-react';
import { getCourseGradient } from '../../utils/helpers';
import Card from '../common/Card';
import Button from '../common/Button';

const CourseCard = ({ course, onDelete }) => {
  const navigate = useNavigate();
  let videoCount = 0;
  let noteCount = 0;
  let pptCount = 0;
  let resCount = 0;

  if (course.curriculum) {
    course.curriculum.forEach(m => {
      m.lessons.forEach(l => {
        if (l.videoUrl) videoCount++;
        if (l.pdfFile) noteCount++;
        if (l.pptFile) pptCount++;
        resCount += l.resources?.length || 0;
      });
    });
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full group">
      {/* Cover Image or Gradient */}
      <div 
        className="h-44 w-full relative flex items-center justify-center text-white overflow-hidden"
        style={{ background: getCourseGradient(course.title) }}
      >
        {course.coverImage && (
          <img
            src={course.coverImage}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Category Badge */}
        <span className="absolute top-4 left-4 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider text-white">
          {course.category}
        </span>

        {/* Status Badge */}
        <span className={`absolute top-4 right-4 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm uppercase tracking-wider
          ${course.status === 'Published'
            ? 'bg-emerald-500 text-white'
            : 'bg-amber-500 text-white'
          }`}
        >
          {course.status}
        </span>
      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4 text-left">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-1 border-t border-slate-100/60 pt-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <User size={12} className="text-slate-400" />
            <span className="truncate">{course.instructor}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <Clock size={12} className="text-slate-400" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <Folder size={12} className="text-slate-400" />
            <span>{course.level}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 border border-slate-200 px-1 py-0.25 rounded">
              {course.language}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold truncate">Language</span>
          </div>
        </div>

        {/* Counter badges */}
        <div className="flex items-center gap-4 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 text-slate-500">
          <div className="flex items-center gap-1" title={`${videoCount} Videos`}>
            <PlayCircle size={13} className="text-brand-500" />
            <span className="text-[10px] font-bold">{videoCount} <span className="text-slate-400 font-medium">Vids</span></span>
          </div>
          <div className="flex items-center gap-1" title={`${noteCount} PDF Notes`}>
            <FileText size={13} className="text-emerald-500" />
            <span className="text-[10px] font-bold">{noteCount} <span className="text-slate-400 font-medium">Notes</span></span>
          </div>
          <div className="flex items-center gap-1" title={`${pptCount} PPTs`}>
            <Folder size={13} className="text-blue-500" />
            <span className="text-[10px] font-bold">{pptCount} <span className="text-slate-400 font-medium">PPTs</span></span>
          </div>
          <div className="flex items-center gap-1" title={`${resCount} Links`}>
            <Link size={13} className="text-indigo-500" />
            <span className="text-[10px] font-bold">{resCount} <span className="text-slate-400 font-medium">Links</span></span>
          </div>
        </div>

        {/* Actions Button Panel */}
        <div className="flex items-center gap-2 border-t border-slate-100/60 pt-3">
          <Button 
            variant="primary" 
            size="sm" 
            className="flex-1 text-xs py-2 bg-brand-600 hover:bg-brand-700" 
            onClick={() => navigate(`/courses/${course.id}`)}
            icon={Eye}
          >
            Manage
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="p-2 py-2 rounded-xl text-slate-600 hover:text-brand-600" 
            onClick={() => navigate(`/courses/edit/${course.id}`)}
          >
            <Edit3 size={14} />
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="p-2 py-2 rounded-xl text-slate-600 hover:text-red-600" 
            onClick={() => onDelete(course.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;
