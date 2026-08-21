import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, XCircle, Search, Trash2, Eye, Archive, ChevronDown, ChevronUp, Video, FileText, Presentation, Layers } from 'lucide-react';
import { adminService } from '../../services/adminService';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await adminService.getCourses();
    setCourses(data);
  };

  const handleUpdateStatus = async (id, status) => {
    await adminService.updateCourseStatus(id, status);
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('Super Admin Warning: Delete this course permanently across all portals?')) return;
    await adminService.deleteCourse(id);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleDeleteLesson = async (courseId, lessonId) => {
    if (!confirm('Delete this specific lesson from the course hierarchy?')) return;
    await adminService.deleteLesson(courseId, lessonId);
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          curriculum: c.curriculum?.map(m => ({
            ...m,
            lessons: m.lessons?.filter(les => les.id !== lessonId)
          }))
        };
      }
      return c;
    }));
  };

  const filtered = courses.filter(c => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch = (c.title || '').toLowerCase().includes(search.toLowerCase()) || (c.instructor || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Super Admin Course & Content Management</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Inspect full curriculum hierarchy, approve, publish, edit, or delete modules & lessons.</p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'Published', 'Draft', 'Archived'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-800 text-slate-400 text-xs max-w-md">
        <Search size={16} />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter courses by title or instructor..."
          className="bg-transparent border-none outline-none text-slate-200 text-xs w-full"
        />
      </div>

      {/* Courses Accordion List */}
      <div className="flex flex-col gap-4">
        {filtered.map(course => {
          const isExpanded = expandedCourseId === course.id;

          return (
            <div key={course.id} className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              <div className="flex gap-4 items-start">
                <img 
                  src={course.coverImage || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=200'} 
                  alt={course.title}
                  className="w-24 h-24 rounded-xl object-cover shrink-0 border border-slate-800"
                />

                <div className="flex-1 flex flex-col justify-between h-full gap-2">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
                        {course.category || 'Development'}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                        course.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {course.status}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white mt-1">{course.title}</h3>
                    <p className="text-xs text-slate-400 font-medium">Instructor: <span className="text-slate-200 font-bold">{course.instructor}</span></p>
                  </div>

                  {/* Course Content Breakdown Pills */}
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 border-t border-slate-800/60 pt-3">
                    <span className="flex items-center gap-1"><Layers size={13} className="text-purple-400"/> {course.moduleCount || 0} Modules</span>
                    <span className="flex items-center gap-1"><Video size={13} className="text-indigo-400"/> {course.videoCount || 0} Videos</span>
                    <span className="flex items-center gap-1"><FileText size={13} className="text-blue-400"/> {course.pdfCount || 0} PDFs</span>
                    <span className="flex items-center gap-1"><Presentation size={13} className="text-emerald-400"/> {course.pptCount || 0} PPTs</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Inspector */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-800 transition-all"
                >
                  <Eye size={14} /> {isExpanded ? 'Hide Hierarchy' : 'Inspect Curriculum'}
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <div className="flex items-center gap-2">
                  {course.status !== 'Published' ? (
                    <button
                      onClick={() => handleUpdateStatus(course.id, 'Published')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-emerald-500/20"
                    >
                      <CheckCircle size={14} /> Approve & Publish
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(course.id, 'Archived')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Archive size={14} /> Archive
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Expanded Course Hierarchy (Modules & Lessons) */}
              {isExpanded && (
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-400">Curriculum Content Inspection</h4>
                  
                  {course.curriculum && course.curriculum.length > 0 ? (
                    course.curriculum.map((mod) => (
                      <div key={mod.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col gap-2">
                        <span className="text-xs font-extrabold text-white">{mod.title}</span>
                        <div className="flex flex-col gap-1 pl-3 border-l-2 border-purple-500/30">
                          {mod.lessons && mod.lessons.length > 0 ? (
                            mod.lessons.map((les) => (
                              <div key={les.id} className="flex justify-between items-center p-2 bg-slate-900/40 rounded-lg text-xs">
                                <div className="flex items-center gap-2 text-slate-300">
                                  <Video size={12} className="text-indigo-400" />
                                  <span className="font-bold">{les.title}</span>
                                  {les.pdfFile && <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">PDF</span>}
                                  {les.pptFile && <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">PPT</span>}
                                </div>
                                <button
                                  onClick={() => handleDeleteLesson(course.id, les.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                                  title="Delete Lesson"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">No lessons in this module.</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No modules added yet for this course.</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManageCourses;
