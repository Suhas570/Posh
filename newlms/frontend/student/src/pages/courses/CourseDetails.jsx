import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayCircle, 
  FileText, 
  Presentation, 
  Link as LinkIcon, 
  Plus, 
  Eye, 
  Sparkles,
  BookOpen,
  FolderDot,
  FileCode,
  Archive,
  Clock,
  User,
  Globe,
  Settings,
  Folder,
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit3,
  UploadCloud,
  File,
  X,
  Check,
  RotateCcw,
  PlusCircle,
  ExternalLink
} from 'lucide-react';

import axios from 'axios';
import { courseService } from '../../services/courseService';
import { getYouTubeId, getCourseGradient } from '../../utils/helpers';

import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview'); // Overview, Curriculum
  
  // Collapsible accordion states
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});

  // Curriculum Modals and Editors
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isManageVideoOpen, setIsManageVideoOpen] = useState(false);
  const [isManageResourceOpen, setIsManageResourceOpen] = useState(false);
  
  // Form input states
  const [moduleTitle, setModuleTitle] = useState('');
  const [lessonInput, setLessonInput] = useState({ title: '', description: '' });
  const [videoInput, setVideoInput] = useState({ title: '', url: '', type: 'YouTube', duration: '', description: '' });
  const [resourceInput, setResourceInput] = useState({ title: '', url: '', type: 'Documentation', description: '' });

  // Mock File upload states
  const [uploadTarget, setUploadTarget] = useState({ lessonId: '', type: 'PDF' }); // PDF, PPT
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const fileInputRef = useRef(null);

  // Video Preview Modal
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    const data = courseService.getCourseById(id);
    if (data) {
      setCourse(data);
      // Auto expand first module if exists
      if (data.curriculum && data.curriculum.length > 0) {
        setExpandedModules({ [data.curriculum[0].id]: true });
      }
    }
  }, [id]);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-left">
        <h2 className="text-base font-bold text-slate-800 mb-1">Course Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">The course you are looking to manage doesn't exist.</p>
        <button 
          onClick={() => navigate('/courses')}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  // Aggregate stats counts
  let videosCount = 0;
  let notesCount = 0;
  let pptsCount = 0;
  let resourcesCount = 0;

  if (course.curriculum) {
    course.curriculum.forEach(m => {
      m.lessons.forEach(l => {
        if (l.videoUrl) videosCount++;
        if (l.pdfFile) notesCount++;
        if (l.pptFile) pptsCount++;
        resourcesCount += l.resources?.length || 0;
      });
    });
  }

  const refreshCourse = () => {
    const updated = courseService.getCourseById(course.id);
    setCourse(updated);
  };

  const saveCurriculum = (newCurriculum) => {
    try {
      courseService.updateCourse(course.id, { curriculum: newCurriculum });
      refreshCourse();
    } catch (e) {
      console.error('[Curriculum] Failed to save updates:', e.message);
    }
  };

  // Add Module
  const handleAddModule = (e) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    const newModule = {
      id: `mod-${Math.random().toString(36).substr(2, 9)}`,
      title: moduleTitle,
      lessons: []
    };
    const updatedCurriculum = [...(course.curriculum || []), newModule];
    saveCurriculum(updatedCurriculum);
    setIsAddModuleOpen(false);
    setModuleTitle('');
    setExpandedModules(prev => ({ ...prev, [newModule.id]: true }));
  };

  // Delete Module
  const handleDeleteModule = (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module and all its lessons?')) return;
    const updatedCurriculum = course.curriculum.filter(m => m.id !== moduleId);
    saveCurriculum(updatedCurriculum);
  };

  // Add Lesson
  const handleAddLesson = (e) => {
    e.preventDefault();
    if (!lessonInput.title.trim()) return;
    const newLesson = {
      id: `les-${Math.random().toString(36).substr(2, 9)}`,
      title: lessonInput.title,
      description: lessonInput.description,
      videoUrl: '',
      videoType: 'YouTube',
      videoDuration: '',
      pdfFile: null,
      pptFile: null,
      resources: []
    };

    const updatedCurriculum = course.curriculum.map(m => {
      if (m.id === activeModuleId) {
        return { ...m, lessons: [...m.lessons, newLesson] };
      }
      return m;
    });

    saveCurriculum(updatedCurriculum);
    setIsAddLessonOpen(false);
    setLessonInput({ title: '', description: '' });
    setExpandedLessons(prev => ({ ...prev, [newLesson.id]: true }));
  };

  // Delete Lesson
  const handleDeleteLesson = (moduleId, lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    const updatedCurriculum = course.curriculum.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
      }
      return m;
    });
    saveCurriculum(updatedCurriculum);
  };

  // Manage Video Link
  const handleSaveVideo = (e) => {
    e.preventDefault();
    if (!videoInput.url.trim() || !videoInput.title.trim()) return;

    const updatedCurriculum = course.curriculum.map(m => {
      return {
        ...m,
        lessons: m.lessons.map(l => {
          if (l.id === activeLessonId) {
            return {
              ...l,
              videoUrl: videoInput.url,
              videoType: videoInput.type,
              videoDuration: videoInput.duration || '10 mins',
              videoTitle: videoInput.title
            };
          }
          return l;
        })
      };
    });

    saveCurriculum(updatedCurriculum);
    setIsManageVideoOpen(false);
  };

  // Add Resource Link
  const handleAddResource = (e) => {
    e.preventDefault();
    if (!resourceInput.title.trim() || !resourceInput.url.trim()) return;

    const newRes = {
      id: `res-${Math.random().toString(36).substr(2, 9)}`,
      title: resourceInput.title,
      url: resourceInput.url,
      type: resourceInput.type,
      description: resourceInput.description
    };

    const updatedCurriculum = course.curriculum.map(m => {
      return {
        ...m,
        lessons: m.lessons.map(l => {
          if (l.id === activeLessonId) {
            return { ...l, resources: [...(l.resources || []), newRes] };
          }
          return l;
        })
      };
    });

    saveCurriculum(updatedCurriculum);
    setIsManageResourceOpen(false);
    setResourceInput({ title: '', url: '', type: 'Documentation', description: '' });
  };

  // Delete Resource Link
  const handleDeleteResource = (lessonId, resId) => {
    if (!window.confirm('Delete this resource link?')) return;
    const updatedCurriculum = course.curriculum.map(m => {
      return {
        ...m,
        lessons: m.lessons.map(l => {
          if (l.id === lessonId) {
            return { ...l, resources: l.resources.filter(r => r.id !== resId) };
          }
          return l;
        })
      };
    });
    saveCurriculum(updatedCurriculum);
  };

  // File Upload Handlers
  const triggerFileUpload = (lessonId, type) => {
    setUploadTarget({ lessonId, type });
    setUploadFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    fileInputRef.current?.click();
  };

  const processFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const nameLower = file.name.toLowerCase();
    const type = uploadTarget.type.toLowerCase(); // pdf, ppt, doc, zip
    if (uploadTarget.type === 'PDF' && !nameLower.endsWith('.pdf')) {
      alert('Only PDF documents are supported for Notes.');
      return;
    }
    if (uploadTarget.type === 'PPT' && !(nameLower.endsWith('.ppt') || nameLower.endsWith('.pptx'))) {
      alert('Only PPT or PPTX templates are supported for Slides.');
      return;
    }
    if (uploadTarget.type === 'DOC' && !(nameLower.endsWith('.doc') || nameLower.endsWith('.docx'))) {
      alert('Only DOC or DOCX Microsoft Word documents are supported.');
      return;
    }
    if (uploadTarget.type === 'ZIP' && !nameLower.endsWith('.zip')) {
      alert('Only ZIP compressed archives are supported.');
      return;
    }

    setUploadFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    });

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const config = {
        headers: {
          'Content-Type': file.type,
          'x-file-name': file.name,
          'x-file-type': type
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      const res = await axios.post('http://localhost:5000/api/upload', file, config);
      setIsUploading(false);
      commitFileToLesson(file.name, (file.size / (1024 * 1024)).toFixed(2) + ' MB', res.data.url);
    } catch (err) {
      console.error('[Upload] Real file upload failed:', err);
      alert('Upload failed. Using fallback simulation...');
      setIsUploading(false);
      commitFileToLesson(file.name, (file.size / (1024 * 1024)).toFixed(2) + ' MB');
    }
  };

  const commitFileToLesson = (fileName, fileSize, explicitUrl) => {
    const fileData = {
      name: fileName,
      size: fileSize,
      url: explicitUrl || `http://localhost:5000/uploads/${uploadTarget.type.toLowerCase()}/${encodeURIComponent(fileName)}`
    };

    const updatedCurriculum = course.curriculum.map(m => {
      return {
        ...m,
        lessons: m.lessons.map(l => {
          if (l.id === uploadTarget.lessonId) {
            if (uploadTarget.type === 'PDF') return { ...l, pdfFile: fileData };
            if (uploadTarget.type === 'PPT') return { ...l, pptFile: fileData };
            if (uploadTarget.type === 'DOC') return { ...l, docFile: fileData };
            if (uploadTarget.type === 'ZIP') return { ...l, zipFile: fileData };
          }
          return l;
        })
      };
    });
    saveCurriculum(updatedCurriculum);
  };

  const handleDeleteFile = (lessonId, fileType) => {
    if (!window.confirm(`Remove this ${fileType} attachment?`)) return;
    const updatedCurriculum = course.curriculum.map(m => {
      return {
        ...m,
        lessons: m.lessons.map(l => {
          if (l.id === lessonId) {
            if (fileType === 'PDF') return { ...l, pdfFile: null };
            if (fileType === 'PPT') return { ...l, pptFile: null };
            if (fileType === 'DOC') return { ...l, docFile: null };
            if (fileType === 'ZIP') return { ...l, zipFile: null };
          }
          return l;
        })
      };
    });
    saveCurriculum(updatedCurriculum);
  };

  const toggleModule = (id) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLesson = (id) => {
    setExpandedLessons(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tabs = [
    { name: 'Overview', icon: BookOpen },
    { name: 'Curriculum', icon: FolderDot }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col text-left mb-8"
    >
      <PageHeader
        title={course.title}
        subtitle="Manage your course metadata parameters and modules syllabus layouts."
        backUrl="/courses"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/courses/edit/${course.id}`)}
            className="text-xs border-slate-200"
          >
            Edit Course Info
          </Button>
        }
      />

      {/* Tabs navigation panel */}
      <div className="flex border-b border-slate-100 mb-6 bg-white p-2 rounded-2xl shadow-sm border border-slate-100/50 justify-between items-center">
        <div className="flex items-center gap-1.5 select-none relative">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-colors focus:outline-none flex items-center gap-2 z-10 cursor-pointer
                ${activeTab === tab.name 
                  ? 'text-brand-600' 
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              {activeTab === tab.name && (
                <motion.div
                  layoutId="activeDetailsTab"
                  className="absolute inset-0 bg-brand-50 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <tab.icon size={14} />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {activeTab === 'Curriculum' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModuleOpen(true)}
            icon={Plus}
            className="text-xs py-2 bg-brand-600 hover:bg-brand-700 whitespace-nowrap"
          >
            Add Module
          </Button>
        )}
      </div>

      {/* Dynamic Tab Panels */}
      <div className="min-h-[300px]">
        {/* OVERVIEW PANEL */}
        {activeTab === 'Overview' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Banner Cover Image & Metadata Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cover Banner */}
              <div 
                className="lg:col-span-2 rounded-2xl h-64 overflow-hidden relative border border-slate-100 flex items-center justify-center text-white"
                style={{ background: getCourseGradient(course.title) }}
              >
                {course.coverImage ? (
                  <img 
                    src={course.coverImage} 
                    alt={course.title} 
                    className="w-full h-full object-cover mix-blend-overlay opacity-90"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 via-purple-600 to-indigo-600 opacity-90" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 text-left flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-extrabold bg-white/20 text-white backdrop-blur-md uppercase tracking-wider">
                      {course.category}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider
                      ${course.status === 'Published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white leading-tight drop-shadow-sm">{course.title}</h2>
                </div>
              </div>

              {/* Course details sidebar info */}
              <Card className="p-5 flex flex-col justify-between gap-5 bg-white border border-slate-100 shadow-premium">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                  <Sparkles size={15} className="text-brand-500" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Metadata Parameters</h3>
                </div>

                <div className="flex flex-col gap-3.5 flex-1 justify-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
                      <User size={15} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Instructor</span>
                      <span className="text-xs font-bold text-slate-700">{course.instructor}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                      <Clock size={15} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Duration</span>
                      <span className="text-xs font-bold text-slate-700">{course.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Folder size={15} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Course Level</span>
                      <span className="text-xs font-bold text-slate-700">{course.level}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                      <Globe size={15} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Language</span>
                      <span className="text-xs font-bold text-slate-700">{course.language}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Course Description */}
            <Card className="p-5 text-left border-slate-100 bg-white">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 pb-2 border-b border-slate-50">Course Description</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {course.description}
              </p>
            </Card>

            {/* Content summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card onClick={() => setActiveTab('Curriculum')} className="p-4 flex items-center gap-3 cursor-pointer bg-white hover:border-brand-200">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <PlayCircle size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Videos</span>
                  <span className="text-lg font-extrabold text-slate-800">{videosCount} vids</span>
                </div>
              </Card>

              <Card onClick={() => setActiveTab('Curriculum')} className="p-4 flex items-center gap-3 cursor-pointer bg-white hover:border-brand-200">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                  <FileText size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Notes</span>
                  <span className="text-lg font-extrabold text-slate-800">{notesCount} PDFs</span>
                </div>
              </Card>

              <Card onClick={() => setActiveTab('Curriculum')} className="p-4 flex items-center gap-3 cursor-pointer bg-white hover:border-brand-200">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <Presentation size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total PPTs</span>
                  <span className="text-lg font-extrabold text-slate-800">{pptsCount} slides</span>
                </div>
              </Card>

              <Card onClick={() => setActiveTab('Curriculum')} className="p-4 flex items-center gap-3 cursor-pointer bg-white hover:border-brand-200">
                <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
                  <LinkIcon size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Resources</span>
                  <span className="text-lg font-extrabold text-slate-800">{resourcesCount} links</span>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* CURRICULUM SYLLABUS PANEL */}
        {activeTab === 'Curriculum' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 text-left"
          >
            {(!course.curriculum || course.curriculum.length === 0) ? (
              <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
                <FolderDot size={28} className="text-slate-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-600">Curriculum is empty</h4>
                <p className="text-[11px] text-slate-400 mb-4">Start by adding your first module folder.</p>
                <Button size="sm" onClick={() => setIsAddModuleOpen(true)}>Add Module</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {course.curriculum.map((mod) => {
                  const isModExpanded = expandedModules[mod.id];
                  return (
                    <Card key={mod.id} className="p-4 bg-white border border-slate-100/80 shadow-sm flex flex-col gap-3">
                      {/* Module Header Title bar */}
                      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => toggleModule(mod.id)}>
                          <span className="text-slate-400">
                            {isModExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </span>
                          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{mod.title}</span>
                          <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-lg">
                            {mod.lessons?.length || 0} Lessons
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setActiveModuleId(mod.id);
                              setIsAddLessonOpen(true);
                            }}
                            className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg text-xs font-bold flex items-center gap-1 border border-brand-100"
                          >
                            <Plus size={12} /> Add Lesson
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Accordion Lessons list */}
                      <AnimatePresence>
                        {isModExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col gap-3 pl-4"
                          >
                            {mod.lessons.length === 0 ? (
                              <span className="text-[11px] text-slate-400 py-3 font-semibold">No lessons inside this module yet.</span>
                            ) : (
                              mod.lessons.map((les) => {
                                const isLesExpanded = expandedLessons[les.id];
                                return (
                                  <div key={les.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20">
                                    {/* Lesson Title header */}
                                    <div 
                                      className="p-3 bg-white hover:bg-slate-50/50 flex items-center justify-between cursor-pointer border-b border-slate-100/50"
                                      onClick={() => toggleLesson(les.id)}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span className="text-slate-400">
                                          {isLesExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                        </span>
                                        <span className="text-xs font-bold text-slate-700">{les.title}</span>
                                      </div>
                                      
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteLesson(mod.id, les.id);
                                        }}
                                        className="p-1 text-slate-400 hover:text-red-500 rounded-lg"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>

                                    {/* Lesson Expanded contents editor */}
                                    {isLesExpanded && (
                                      <div className="p-4 flex flex-col gap-5 text-left bg-white">
                                        {les.description && (
                                          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                                            {les.description}
                                          </p>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                          {/* Lesson Video URL */}
                                          <div className="flex flex-col gap-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lesson Video</span>
                                            
                                            {les.videoUrl ? (
                                              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-3">
                                                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                                    <PlayCircle size={16} />
                                                  </div>
                                                  <div className="flex flex-col leading-tight">
                                                    <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{les.videoTitle || 'Lecture Video'}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{les.videoType} • {les.videoDuration}</span>
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                  <button
                                                    onClick={() => setPreviewVideo({ title: les.videoTitle || les.title, url: les.videoUrl, type: les.videoType, duration: les.videoDuration })}
                                                    className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg"
                                                    title="Preview"
                                                  >
                                                    <Eye size={13} />
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setActiveLessonId(les.id);
                                                      setVideoInput({ title: les.videoTitle || '', url: les.videoUrl, type: les.videoType, duration: les.videoDuration });
                                                      setIsManageVideoOpen(true);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                                                    title="Edit Link"
                                                  >
                                                    <Edit3 size={13} />
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <button
                                                onClick={() => {
                                                  setActiveLessonId(les.id);
                                                  setVideoInput({ title: '', url: '', type: 'YouTube', duration: '', description: '' });
                                                  setIsManageVideoOpen(true);
                                                }}
                                                className="border border-dashed border-slate-200 hover:border-brand-300 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 bg-slate-50/20 text-slate-400 hover:text-brand-600 transition-colors h-24"
                                              >
                                                <PlayCircle size={20} />
                                                <span className="text-[10px] font-bold uppercase">Assign Video Link</span>
                                              </button>
                                            )}
                                          </div>

                                          {/* Lesson Attachments & Resources Column (Right Side) */}
                                          <div className="flex flex-col gap-5">
                                            {/* Dash uploader grid */}
                                            <div className="flex flex-col gap-2">
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">Upload Attachments</span>
                                              <div className="grid grid-cols-2 gap-3">
                                                
                                                {/* PDF notes */}
                                                <div className="flex flex-col gap-1">
                                                  <span className="text-[9px] font-bold text-slate-400 uppercase">PDF Notes</span>
                                                  {les.pdfFile ? (
                                                    <div className="p-2 border border-rose-100 rounded-xl bg-rose-50/20 flex items-center justify-between text-left h-12">
                                                      <span className="text-[10px] font-bold text-rose-700 truncate max-w-[70%]" title={les.pdfFile.name}>{les.pdfFile.name}</span>
                                                      <button type="button" onClick={() => handleDeleteFile(les.id, 'PDF')} className="text-slate-400 hover:text-red-500">
                                                        <X size={12} />
                                                      </button>
                                                    </div>
                                                  ) : (
                                                    <button
                                                      type="button"
                                                      onClick={() => triggerFileUpload(les.id, 'PDF')}
                                                      className="border border-dashed border-slate-200 hover:border-brand-300 hover:bg-slate-50/50 p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-brand-600 transition-all h-12"
                                                    >
                                                      <FileText size={14} />
                                                      <span className="text-[8px] font-bold uppercase">Upload PDF</span>
                                                    </button>
                                                  )}
                                                </div>

                                                {/* PPT slides */}
                                                <div className="flex flex-col gap-1">
                                                  <span className="text-[9px] font-bold text-slate-400 uppercase">PPT Slides</span>
                                                  {les.pptFile ? (
                                                    <div className="p-2 border border-blue-100 rounded-xl bg-blue-50/20 flex items-center justify-between text-left h-12">
                                                      <span className="text-[10px] font-bold text-blue-700 truncate max-w-[70%]" title={les.pptFile.name}>{les.pptFile.name}</span>
                                                      <button type="button" onClick={() => handleDeleteFile(les.id, 'PPT')} className="text-slate-400 hover:text-red-500">
                                                        <X size={12} />
                                                      </button>
                                                    </div>
                                                  ) : (
                                                    <button
                                                      type="button"
                                                      onClick={() => triggerFileUpload(les.id, 'PPT')}
                                                      className="border border-dashed border-slate-200 hover:border-brand-300 hover:bg-slate-50/50 p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-brand-600 transition-all h-12"
                                                    >
                                                      <Presentation size={14} />
                                                      <span className="text-[8px] font-bold uppercase">Upload PPT</span>
                                                    </button>
                                                  )}
                                                </div>

                                                {/* DOC Word */}
                                                <div className="flex flex-col gap-1">
                                                  <span className="text-[9px] font-bold text-slate-400 uppercase">DOC Document</span>
                                                  {les.docFile ? (
                                                    <div className="p-2 border border-emerald-100 rounded-xl bg-emerald-50/20 flex items-center justify-between text-left h-12">
                                                      <span className="text-[10px] font-bold text-emerald-700 truncate max-w-[70%]" title={les.docFile.name}>{les.docFile.name}</span>
                                                      <button type="button" onClick={() => handleDeleteFile(les.id, 'DOC')} className="text-slate-400 hover:text-red-500">
                                                        <X size={12} />
                                                      </button>
                                                    </div>
                                                  ) : (
                                                    <button
                                                      type="button"
                                                      onClick={() => triggerFileUpload(les.id, 'DOC')}
                                                      className="border border-dashed border-slate-200 hover:border-brand-300 hover:bg-slate-50/50 p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-brand-600 transition-all h-12"
                                                    >
                                                      <FileCode size={14} />
                                                      <span className="text-[8px] font-bold uppercase">Upload DOC</span>
                                                    </button>
                                                  )}
                                                </div>

                                                {/* ZIP archive */}
                                                <div className="flex flex-col gap-1">
                                                  <span className="text-[9px] font-bold text-slate-400 uppercase">ZIP Archive</span>
                                                  {les.zipFile ? (
                                                    <div className="p-2 border border-purple-100 rounded-xl bg-purple-50/20 flex items-center justify-between text-left h-12">
                                                      <span className="text-[10px] font-bold text-purple-700 truncate max-w-[70%]" title={les.zipFile.name}>{les.zipFile.name}</span>
                                                      <button type="button" onClick={() => handleDeleteFile(les.id, 'ZIP')} className="text-slate-400 hover:text-red-500">
                                                        <X size={12} />
                                                      </button>
                                                    </div>
                                                  ) : (
                                                    <button
                                                      type="button"
                                                      onClick={() => triggerFileUpload(les.id, 'ZIP')}
                                                      className="border border-dashed border-slate-200 hover:border-brand-300 hover:bg-slate-50/50 p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-brand-600 transition-all h-12"
                                                    >
                                                      <Archive size={14} />
                                                      <span className="text-[8px] font-bold uppercase">Upload ZIP</span>
                                                    </button>
                                                  )}
                                                </div>

                                              </div>
                                            </div>

                                            {/* External Link Resources */}
                                            <div className="flex flex-col gap-2">
                                              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lesson Resources</span>
                                                <button
                                                  onClick={() => {
                                                    setActiveLessonId(les.id);
                                                    setResourceInput({ title: '', url: '', type: 'Documentation', description: '' });
                                                    setIsManageResourceOpen(true);
                                                  }}
                                                  className="text-[10px] font-bold text-brand-600 hover:underline flex items-center gap-0.5"
                                                >
                                                  <Plus size={11} /> Link URL
                                                </button>
                                              </div>

                                              <div className="flex flex-col gap-2">
                                                {(!les.resources || les.resources.length === 0) ? (
                                                  <span className="text-[10px] text-slate-400 py-2.5 text-center border border-dashed rounded-xl border-slate-100 bg-slate-50/10 font-semibold select-none">No resource links.</span>
                                                ) : (
                                                  les.resources.map((res) => (
                                                    <div key={res.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-left shadow-sm">
                                                      <div className="flex items-center gap-2 max-w-[80%]">
                                                        <LinkIcon size={12} className="text-purple-500" />
                                                        <div className="flex flex-col leading-tight">
                                                          <span className="text-xs font-bold text-slate-800 truncate">{res.title}</span>
                                                          <span className="text-[8px] font-extrabold uppercase text-brand-600 mt-0.5">{res.type}</span>
                                                        </div>
                                                      </div>
                                                      <button
                                                        onClick={() => handleDeleteResource(les.id, res.id)}
                                                        className="p-1 text-slate-400 hover:text-red-500"
                                                      >
                                                        <X size={12} />
                                                      </button>
                                                    </div>
                                                  ))
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                        </div>

                                        {/* Mock Active Upload Progress Loader inside Lesson */}
                                        {isUploading && uploadTarget.lessonId === les.id && (
                                          <div className="p-3 bg-brand-50/30 border border-brand-100 rounded-xl flex flex-col gap-2 mt-2">
                                            <div className="flex justify-between items-center text-[9px] text-slate-500 font-extrabold uppercase">
                                              <span>Uploading {uploadTarget.type} File: {uploadFile?.name}</span>
                                              <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                              <div className="bg-brand-500 h-full" style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Hidden File Input Picker */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={processFileUpload}
      />

      {/* Add Module Modal */}
      <Modal
        isOpen={isAddModuleOpen}
        onClose={() => setIsAddModuleOpen(false)}
        title="Add Curriculum Module"
        size="sm"
      >
        <form onSubmit={handleAddModule} className="flex flex-col gap-4 text-left">
          <Input
            label="Module Title"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="e.g. Module 1: Getting Started"
            required
          />
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <Button variant="secondary" onClick={() => setIsAddModuleOpen(false)} className="text-xs border-slate-200">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="text-xs bg-brand-600 hover:bg-brand-700">
              Save Module
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal
        isOpen={isAddLessonOpen}
        onClose={() => setIsAddLessonOpen(false)}
        title="Add Lesson to Module"
        size="sm"
      >
        <form onSubmit={handleAddLesson} className="flex flex-col gap-4 text-left">
          <Input
            label="Lesson Title"
            value={lessonInput.title}
            onChange={(e) => setLessonInput(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Lesson 1.1: Component Layout Overview"
            required
          />
          <Input
            label="Lesson Description"
            value={lessonInput.description}
            onChange={(e) => setLessonInput(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief summaries of discussed concepts..."
          />
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <Button variant="secondary" onClick={() => setIsAddLessonOpen(false)} className="text-xs border-slate-200">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="text-xs bg-brand-600 hover:bg-brand-700">
              Save Lesson
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manage Video Modal */}
      <Modal
        isOpen={isManageVideoOpen}
        onClose={() => setIsManageVideoOpen(false)}
        title="Assign Lecture Video"
        size="md"
      >
        <form onSubmit={handleSaveVideo} className="flex flex-col gap-4 text-left">
          <Input
            label="Video Title"
            value={videoInput.title}
            onChange={(e) => setVideoInput(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Introduction to JSX"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Video Stream Format"
              options={['YouTube', 'Animated Video', 'Pre-recorded Video']}
              value={videoInput.type}
              onChange={(e) => setVideoInput(prev => ({ ...prev, type: e.target.value }))}
            />
            <Input
              label="Duration (e.g. 20 mins)"
              value={videoInput.duration}
              onChange={(e) => setVideoInput(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="e.g. 15 mins"
            />
          </div>
          <Input
            label="Video URL Link"
            value={videoInput.url}
            onChange={(e) => setVideoInput(prev => ({ ...prev, url: e.target.value }))}
            placeholder="YouTube, MP4, or cloud video URL links"
            required
          />
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <Button variant="secondary" onClick={() => setIsManageVideoOpen(false)} className="text-xs border-slate-200">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="text-xs bg-brand-600 hover:bg-brand-700">
              Save Video Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Resource Modal */}
      <Modal
        isOpen={isManageResourceOpen}
        onClose={() => setIsManageResourceOpen(false)}
        title="Link External Resource URL"
        size="sm"
      >
        <form onSubmit={handleAddResource} className="flex flex-col gap-4 text-left">
          <Input
            label="Resource Name"
            value={resourceInput.title}
            onChange={(e) => setResourceInput(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. GitHub Repository"
            required
          />
          <Select
            label="Resource Category"
            options={['Documentation', 'GitHub', 'Website', 'Article']}
            value={resourceInput.type}
            onChange={(e) => setResourceInput(prev => ({ ...prev, type: e.target.value }))}
          />
          <Input
            label="URL Link"
            value={resourceInput.url}
            onChange={(e) => setResourceInput(prev => ({ ...prev, url: e.target.value }))}
            placeholder="e.g. https://github.com/..."
            required
          />
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <Button variant="secondary" onClick={() => setIsManageResourceOpen(false)} className="text-xs border-slate-200">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="text-xs bg-brand-600 hover:bg-brand-700">
              Link Resource
            </Button>
          </div>
        </form>
      </Modal>

      {/* Video Preview Modal */}
      <Modal
        isOpen={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
        title={previewVideo ? `Preview: ${previewVideo.title}` : ''}
        size="lg"
      >
        {previewVideo && (
          <div className="flex flex-col gap-4 text-left">
            {/* Video Player */}
            <div className="w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              {getYouTubeId(previewVideo.url) ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYouTubeId(previewVideo.url)}?autoplay=1`}
                  title={previewVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={previewVideo.url}
                  className="w-full h-full"
                  controls
                  autoPlay
                  onError={(e) => {
                    console.error('Video file loading error, fallback player');
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {/* Video Details */}
            <div className="flex flex-col gap-1.5 p-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-600 uppercase tracking-wider border border-brand-100">
                  {previewVideo.type}
                </span>
                <span className="text-xs font-bold text-slate-400">{previewVideo.duration}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mt-1">{previewVideo.title}</h4>
              <span className="text-[10px] text-slate-400 font-medium uppercase mt-2">
                URL Source: <a href={previewVideo.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-bold hover:underline select-all">{previewVideo.url}</a>
              </span>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default CourseDetails;
