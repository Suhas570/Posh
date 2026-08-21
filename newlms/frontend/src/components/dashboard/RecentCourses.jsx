import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, FileText, Link, ArrowUpRight } from 'lucide-react';
import { getCourseGradient } from '../../utils/helpers';
import Card from '../common/Card';
import Button from '../common/Button';

const RecentCourses = ({ courses = [] }) => {
  const navigate = useNavigate();
  const recent = [...courses]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Recent Courses</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/courses')}
          className="text-xs font-bold text-brand-600 hover:text-brand-700"
        >
          View All
        </Button>
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-8 text-xs font-medium text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          No courses available. Create one to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recent.map((course) => {
            let videoCount = 0;
            let noteCount = 0;
            let resCount = 0;
            if (course.curriculum) {
              course.curriculum.forEach(m => {
                m.lessons?.forEach(l => {
                  if (l.videoUrl) videoCount++;
                  if (l.pdfFile) noteCount++;
                  if (l.pptFile) noteCount++;
                  resCount += l.resources?.length || 0;
                });
              });
            }
            
            return (
              <Card
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="overflow-hidden flex flex-col h-full group"
              >
                {/* Header Gradient / Image */}
                <div 
                  className="h-28 w-full flex items-center justify-center text-white relative"
                  style={{ background: getCourseGradient(course.title) }}
                >
                  {course.coverImage && (
                    <img 
                      src={course.coverImage} 
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90 transition-transform group-hover:scale-105 duration-300"
                    />
                  )}
                  <span className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider">
                    {course.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-left">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">{course.duration}</p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center justify-between border-t border-slate-50 pt-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                      ${course.status === 'Published'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {course.status}
                    </span>

                    {/* Resources Counters */}
                    <div className="flex items-center gap-2.5 text-slate-400">
                      <div className="flex items-center gap-0.5" title={`${videoCount} Videos`}>
                        <PlayCircle size={12} />
                        <span className="text-[10px] font-bold">{videoCount}</span>
                      </div>
                      <div className="flex items-center gap-0.5" title={`${noteCount} PDF Notes`}>
                        <FileText size={12} />
                        <span className="text-[10px] font-bold">{noteCount}</span>
                      </div>
                      <div className="flex items-center gap-0.5" title={`${resCount} Links`}>
                        <Link size={12} />
                        <span className="text-[10px] font-bold">{resCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentCourses;
