import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Download, 
  ExternalLink, 
  FileText, 
  Presentation, 
  FileCode,
  Archive,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { studentService } from '../../services/studentService';

const LearningPlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModIdx, setActiveModIdx] = useState(0);
  const [activeLesIdx, setActiveLesIdx] = useState(0);
  const [expandedMods, setExpandedMods] = useState({});
  const [completedLessons, setCompletedLessons] = useState([]);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const data = await studentService.getCourseDetails(courseId);
        setCourse(data);
        
        // Auto expand first module
        setExpandedMods({ 0: true });

        // Load completed lesson list
        const completed = JSON.parse(localStorage.getItem('student_lms_completed_lessons') || '{}');
        setCompletedLessons(completed[courseId] || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-pulse">
        <BookOpen size={48} className="text-indigo-600 animate-bounce" />
      </div>
    );
  }

  if (!course || !course.curriculum || course.curriculum.length === 0) {
    return (
      <Card className="p-12 text-center flex flex-col items-center justify-center bg-white border-slate-200">
        <BookOpen size={48} className="text-slate-400 mb-3" />
        <h4 className="text-sm font-extrabold text-slate-800">No content available</h4>
        <p className="text-xs text-slate-400 mt-1 mb-4">This course curriculum is empty.</p>
        <Button variant="outline" onClick={() => navigate('/student/browse')}>Back to Browse</Button>
      </Card>
    );
  }

  // Active items
  const activeModule = course.curriculum[activeModIdx];
  const activeLesson = activeModule?.lessons?.[activeLesIdx];

  const toggleModule = (index) => {
    setExpandedMods(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleLessonSelect = (mIdx, lIdx) => {
    setActiveModIdx(mIdx);
    setActiveLesIdx(lIdx);
  };

  const isCompleted = (lessonId) => {
    return completedLessons.includes(lessonId);
  };

  const handleToggleComplete = () => {
    if (!activeLesson) return;
    const lessonId = activeLesson.id;
    const isNowComplete = studentService.toggleLessonComplete(courseId, lessonId);
    
    // Refresh completions state
    const completed = JSON.parse(localStorage.getItem('student_lms_completed_lessons') || '{}');
    const list = completed[courseId] || [];
    setCompletedLessons(list);

    // Auto register enrollment if not enrolled yet
    studentService.enrollInCourse(courseId);
  };

  // Next / Prev actions
  const hasNext = () => {
    const nextMod = course.curriculum[activeModIdx];
    if (activeLesIdx < (nextMod?.lessons?.length || 0) - 1) return true;
    if (activeModIdx < course.curriculum.length - 1) return true;
    return false;
  };

  const hasPrev = () => {
    if (activeLesIdx > 0) return true;
    if (activeModIdx > 0) return true;
    return false;
  };

  const handleNext = () => {
    const currentMod = course.curriculum[activeModIdx];
    if (activeLesIdx < (currentMod?.lessons?.length || 0) - 1) {
      setActiveLesIdx(activeLesIdx + 1);
    } else if (activeModIdx < course.curriculum.length - 1) {
      setActiveModIdx(activeModIdx + 1);
      setActiveLesIdx(0);
      setExpandedMods(prev => ({ ...prev, [activeModIdx + 1]: true }));
    }
  };

  const handlePrev = () => {
    if (activeLesIdx > 0) {
      setActiveLesIdx(activeLesIdx - 1);
    } else if (activeModIdx > 0) {
      const prevModIdx = activeModIdx - 1;
      const prevMod = course.curriculum[prevModIdx];
      setActiveModIdx(prevModIdx);
      setActiveLesIdx((prevMod?.lessons?.length || 0) - 1);
      setExpandedMods(prev => ({ ...prev, [prevModIdx]: true }));
    }
  };

  return (
    <div className="flex flex-col gap-5 text-left select-none">
      
      {/* Header controls bar */}
      <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="icon"
            onClick={() => navigate('/student/my-learning')}
            className="rounded-xl border-slate-200 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-base font-extrabold text-slate-800 leading-tight">{course.title}</h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{course.instructor} • Course Player</span>
          </div>
        </div>
      </div>

      {/* Main player workspace - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Modules & Lessons Navigation (1 Column) */}
        <div className="lg:col-span-1 flex flex-col gap-3 bg-white border border-slate-200/50 rounded-[20px] p-4 max-h-[70vh] overflow-y-auto shadow-sm">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest px-1">Curriculum</h3>
          
          <div className="flex flex-col gap-2">
            {course.curriculum.map((mod, mIdx) => {
              const isExpanded = !!expandedMods[mIdx];
              return (
                <div key={mod.id} className="flex flex-col gap-1 border-b border-slate-50 pb-2 last:border-b-0">
                  <button
                    onClick={() => toggleModule(mIdx)}
                    className="w-full flex items-center justify-between py-2 text-xs font-extrabold text-slate-700 hover:text-indigo-600 transition-all text-left cursor-pointer"
                  >
                    <span className="line-clamp-1">{mod.title}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  
                  {isExpanded && (
                    <div className="flex flex-col gap-1 pl-2">
                      {mod.lessons?.map((les, lIdx) => {
                        const isCurrent = activeModIdx === mIdx && activeLesIdx === lIdx;
                        const complete = isCompleted(les.id);
                        return (
                          <button
                            key={les.id}
                            onClick={() => handleLessonSelect(mIdx, lIdx)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-[11px] font-bold transition-all text-left cursor-pointer
                              ${isCurrent 
                                ? 'bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-100/30' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                              }`}
                          >
                            <span className="line-clamp-1 pr-1">{les.title}</span>
                            {complete && <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Video Viewport Panel (2 Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {activeLesson ? (
            <div className="flex flex-col gap-4">
              
              {/* Premium video player viewport */}
              <div className="aspect-video w-full bg-slate-900 rounded-[20px] overflow-hidden relative shadow-md flex flex-col items-center justify-center text-slate-400">
                {activeLesson.videoUrl ? (
                  activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be') ? (
                    (() => {
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                      const match = activeLesson.videoUrl.match(regExp);
                      const videoId = (match && match[2].length === 11) ? match[2] : null;
                      
                      return videoId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                          title={activeLesson.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                          <Play size={36} className="text-red-500 mb-2" />
                          <span className="text-xs font-bold text-slate-300">Invalid YouTube Link</span>
                        </div>
                      );
                    })()
                  ) : (
                    <video
                      src={activeLesson.videoUrl}
                      controls
                      className="w-full h-full object-cover"
                      placeholder="Loading video stream..."
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <Play size={48} className="text-indigo-500 mb-2 fill-indigo-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {activeLesson.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium mt-1">
                      No lecture video uploaded for this lesson.
                    </span>
                  </div>
                )}
              </div>

              {/* Lesson Text Description */}
              <Card className="p-5 text-left border-slate-200/50">
                <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                  {activeLesson.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                  {activeLesson.description || 'No lesson outline description provided.'}
                </p>
              </Card>

            </div>
          ) : (
            <Card className="p-12 text-center bg-white border-slate-200">
              <Play size={36} className="text-slate-300 mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No lesson selected</h4>
              <p className="text-[10px] text-slate-400">Select a lesson from the curriculum sidebar to begin.</p>
            </Card>
          )}
        </div>

        {/* Right Side: Attachments & Resources View (1 Column) */}
        <div className="lg:col-span-1 flex flex-col gap-4 bg-white border border-slate-200/50 rounded-[20px] p-4 shadow-sm text-left">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Lesson Assets</h3>
          
          {activeLesson ? (
            <div className="flex flex-col gap-4">
              
              {/* Notes block */}
              {activeLesson.pdfFile && (
                <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200/40">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <FileText size={16} />
                    <span className="text-xs font-bold text-slate-700 line-clamp-1">{activeLesson.pdfFile.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">{activeLesson.pdfFile.size || 'Size unknown'}</span>
                  <a href={activeLesson.pdfFile.url || '#'} download={activeLesson.pdfFile.name} target="_blank" rel="noreferrer" className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-[10px] font-extrabold mt-1 cursor-pointer bg-white"
                    >
                      <Download size={11} className="mr-1" /> Download PDF
                    </Button>
                  </a>
                </div>
              )}

              {/* PPT file block */}
              {activeLesson.pptFile && (
                <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200/40">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Presentation size={16} />
                    <span className="text-xs font-bold text-slate-700 line-clamp-1">{activeLesson.pptFile.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">{activeLesson.pptFile.size || 'Size unknown'}</span>
                  <a href={activeLesson.pptFile.url || '#'} download={activeLesson.pptFile.name} target="_blank" rel="noreferrer" className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-[10px] font-extrabold mt-1 cursor-pointer bg-white"
                    >
                      <Download size={11} className="mr-1" /> Download Slide Deck
                    </Button>
                  </a>
                </div>
              )}

              {/* DOC file block */}
              {activeLesson.docFile && (
                <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200/40">
                  <div className="flex items-center gap-2 text-blue-600">
                    <FileCode size={16} />
                    <span className="text-xs font-bold text-slate-700 line-clamp-1">{activeLesson.docFile.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">{activeLesson.docFile.size || 'Size unknown'}</span>
                  <a href={activeLesson.docFile.url || '#'} download={activeLesson.docFile.name} target="_blank" rel="noreferrer" className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-[10px] font-extrabold mt-1 cursor-pointer bg-white"
                    >
                      <Download size={11} className="mr-1" /> Download Document
                    </Button>
                  </a>
                </div>
              )}

              {/* ZIP file block */}
              {activeLesson.zipFile && (
                <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200/40">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Archive size={16} />
                    <span className="text-xs font-bold text-slate-700 line-clamp-1">{activeLesson.zipFile.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">{activeLesson.zipFile.size || 'Size unknown'}</span>
                  <a href={activeLesson.zipFile.url || '#'} download={activeLesson.zipFile.name} target="_blank" rel="noreferrer" className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-[10px] font-extrabold mt-1 cursor-pointer bg-white"
                    >
                      <Download size={11} className="mr-1" /> Download Archive
                    </Button>
                  </a>
                </div>
              )}

              {/* Resources list */}
              {activeLesson.resources && activeLesson.resources.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Web Resources</span>
                  <div className="flex flex-col gap-1.5">
                    {activeLesson.resources.map(res => (
                      <a 
                        key={res.id}
                        href={res.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/40 text-[10px] font-bold text-slate-600 hover:text-indigo-600 transition-all"
                      >
                        <span className="line-clamp-1">{res.title}</span>
                        <ExternalLink size={10} className="flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {!activeLesson.pdfFile && !activeLesson.pptFile && !activeLesson.docFile && !activeLesson.zipFile && (!activeLesson.resources || activeLesson.resources.length === 0) && (
                <span className="text-[10px] text-slate-400 font-medium">No files or URL references available.</span>
              )}

            </div>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Select a lesson to view files.</span>
          )}
        </div>

      </div>

      {/* Bottom Pane navigation buttons & Completion toggle */}
      {activeLesson && (
        <Card className="p-4 flex items-center justify-between bg-white border-slate-200/50 shadow-sm mt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={!hasPrev()}
              className="text-[10px] font-extrabold cursor-pointer"
            >
              <ChevronLeft size={12} className="mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={!hasNext()}
              className="text-[10px] font-extrabold cursor-pointer"
            >
              Next <ChevronRight size={12} className="ml-1" />
            </Button>
          </div>

          <Button
            variant={isCompleted(activeLesson.id) ? 'outline' : 'primary'}
            size="sm"
            onClick={handleToggleComplete}
            className={`text-[10px] font-extrabold cursor-pointer ${isCompleted(activeLesson.id) ? 'border-emerald-200 hover:bg-emerald-50/20 text-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            {isCompleted(activeLesson.id) ? '✓ Completed' : 'Mark Lesson Complete'}
          </Button>
        </Card>
      )}

    </div>
  );
};

export default LearningPlayer;
