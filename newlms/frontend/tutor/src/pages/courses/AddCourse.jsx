import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Check, 
  Trash2, 
  Video, 
  FileText, 
  Presentation, 
  Link as LinkIcon, 
  Sliders, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Save,
  Clock,
  User,
  Globe,
  Tag,
  UploadCloud,
  File,
  X,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  FileCode,
  Archive,
  Download,
  FolderDot
} from 'lucide-react';

import axios from 'axios';
import { useCourses } from '../../hooks/useCourses';
import { CATEGORIES, LEVELS, LANGUAGES, STATUSES } from '../../utils/constants';
import { validateCourse } from '../../utils/validators';
import { generateId } from '../../utils/helpers';

import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';

const AddCourse = () => {
  const navigate = useNavigate();
  const { addCourse } = useCourses();

  const [activeStep, setActiveStep] = useState(1);
  const [errors, setErrors] = useState({});

  // 1. Wizard Course Form State
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0] || 'Development',
    coverImage: '',
    instructor: 'Manoj',
    duration: '',
    level: LEVELS[0] || 'Beginner',
    language: LANGUAGES[0] || 'English',
    status: 'Draft',
    curriculum: [] // Array of modules
  });

  // Collapsible accordion states
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});

  // Inline uploader simulation states
  const [uploadState, setUploadState] = useState({
    lessonId: '',
    fileType: '', // PDF, PPT, DOC, ZIP
    progress: 0,
    isUploading: false,
    fileName: ''
  });

  // Add module trigger states
  const [moduleInputTitle, setModuleInputTitle] = useState('');
  const [isAddingModuleInline, setIsAddingModuleInline] = useState(false);

  const fileInputRef = useRef(null);
  const activeLessonRef = useRef('');
  const activeFileTypeRef = useRef('');

  // Stepper Labels
  const steps = [
    { label: 'Basic Info', index: 1 },
    { label: 'Course Details', index: 2 },
    { label: 'Learning Content', index: 3 }
  ];

  // Course metadata handlers
  const handleCourseChange = (id, value) => {
    setCourseData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  // Step Navigations
  const handleNext = () => {
    let isValid = true;
    const newErrors = {};

    if (activeStep === 1) {
      if (!courseData.title.trim()) {
        newErrors.title = 'Course Title is required';
        isValid = false;
      }
      if (!courseData.description.trim()) {
        newErrors.description = 'Description is required';
        isValid = false;
      }
      if (!courseData.category) {
        newErrors.category = 'Category is required';
        isValid = false;
      }
    } else if (activeStep === 2) {
      if (!courseData.instructor.trim()) {
        newErrors.instructor = 'Instructor name is required';
        isValid = false;
      }
      if (!courseData.duration.trim()) {
        newErrors.duration = 'Duration is required';
        isValid = false;
      }
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setActiveStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  // Add Module
  const handleAddModuleInline = () => {
    if (!moduleInputTitle.trim()) return;
    const newModule = {
      id: `mod-${Math.random().toString(36).substr(2, 9)}`,
      title: moduleInputTitle,
      lessons: []
    };
    setCourseData(prev => ({
      ...prev,
      curriculum: [...prev.curriculum, newModule]
    }));
    setModuleInputTitle('');
    setIsAddingModuleInline(false);
    setExpandedModules(prev => ({ ...prev, [newModule.id]: true }));
  };

  // Delete Module
  const handleDeleteModule = (moduleId) => {
    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.filter(m => m.id !== moduleId)
    }));
  };

  // Reorder Modules Up/Down
  const handleMoveModule = (index, direction) => {
    const newCurriculum = [...courseData.curriculum];
    if (direction === 'up' && index > 0) {
      const temp = newCurriculum[index];
      newCurriculum[index] = newCurriculum[index - 1];
      newCurriculum[index - 1] = temp;
    } else if (direction === 'down' && index < newCurriculum.length - 1) {
      const temp = newCurriculum[index];
      newCurriculum[index] = newCurriculum[index + 1];
      newCurriculum[index + 1] = temp;
    }
    setCourseData(prev => ({ ...prev, curriculum: newCurriculum }));
  };

  // Add Lesson
  const handleAddLessonInline = (moduleId) => {
    const newLesson = {
      id: `les-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Lesson',
      videoUrl: '',
      videoType: 'YouTube',
      description: '',
      pdfFile: null,
      pptFile: null,
      docFile: null,
      zipFile: null,
      resources: []
    };

    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: [...m.lessons, newLesson] };
        }
        return m;
      })
    }));

    setExpandedLessons(prev => ({ ...prev, [newLesson.id]: true }));
  };

  // Edit Lesson fields dynamically
  const handleLessonFieldChange = (moduleId, lessonId, field, value) => {
    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id === lessonId) {
                return { ...l, [field]: value };
              }
              return l;
            })
          };
        }
        return m;
      })
    }));
  };

  // Delete Lesson
  const handleDeleteLesson = (moduleId, lessonId) => {
    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
        }
        return m;
      })
    }));
  };

  // Reorder Lessons Up/Down inside a Module
  const handleMoveLesson = (moduleId, lessonIndex, direction) => {
    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map(m => {
        if (m.id === moduleId) {
          const newLessons = [...m.lessons];
          if (direction === 'up' && lessonIndex > 0) {
            const temp = newLessons[lessonIndex];
            newLessons[lessonIndex] = newLessons[lessonIndex - 1];
            newLessons[lessonIndex - 1] = temp;
          } else if (direction === 'down' && lessonIndex < newLessons.length - 1) {
            const temp = newLessons[lessonIndex];
            newLessons[lessonIndex] = newLessons[lessonIndex + 1];
            newLessons[lessonIndex + 1] = temp;
          }
          return { ...m, lessons: newLessons };
        }
        return m;
      })
    }));
  };

  // Simulated File Attachment Uploaders
  const triggerAttachmentUpload = (lessonId, fileType) => {
    activeLessonRef.current = lessonId;
    activeFileTypeRef.current = fileType;
    setUploadState({
      lessonId,
      fileType,
      progress: 0,
      isUploading: false,
      fileName: ''
    });
    fileInputRef.current?.click();
  };

  const handleAttachmentFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type extensions
    const nameLower = file.name.toLowerCase();
    const type = activeFileTypeRef.current;
    if (type === 'PDF' && !nameLower.endsWith('.pdf')) {
      alert('Only PDF documents are supported for Notes.');
      return;
    }
    if (type === 'PPT' && !(nameLower.endsWith('.ppt') || nameLower.endsWith('.pptx'))) {
      alert('Only PPT or PPTX templates are supported for Slides.');
      return;
    }
    if (type === 'DOC' && !(nameLower.endsWith('.doc') || nameLower.endsWith('.docx'))) {
      alert('Only Microsoft Word DOC or DOCX documents are supported.');
      return;
    }
    if (type === 'ZIP' && !nameLower.endsWith('.zip')) {
      alert('Only ZIP compressed archive files are supported.');
      return;
    }

    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      fileName: file.name
    }));

    try {
      const config = {
        headers: {
          'Content-Type': file.type,
          'x-file-name': file.name,
          'x-file-type': type.toLowerCase()
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadState(prev => ({ ...prev, progress: percentCompleted }));
        }
      };

      const res = await axios.post('http://localhost:5000/api/upload', file, config);
      setUploadState(prev => ({ ...prev, isUploading: false }));
      commitAttachmentToState(file.name, (file.size / (1024 * 1024)).toFixed(2) + ' MB', res.data.url);
    } catch (err) {
      console.error('[Upload] Wizard real file upload failed:', err);
      alert('Upload failed. Using fallback simulation...');
      setUploadState(prev => ({ ...prev, isUploading: false }));
      commitAttachmentToState(file.name, (file.size / (1024 * 1024)).toFixed(2) + ' MB');
    }
  };

  const commitAttachmentToState = (name, size, explicitUrl) => {
    const fileObj = {
      name,
      size,
      url: explicitUrl || `http://localhost:5000/uploads/${activeFileTypeRef.current.toLowerCase()}/${encodeURIComponent(name)}`
    };

    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map(m => {
        return {
          ...m,
          lessons: m.lessons.map(l => {
            if (l.id === activeLessonRef.current) {
              const fileKey = activeFileTypeRef.current === 'PDF' ? 'pdfFile' :
                              activeFileTypeRef.current === 'PPT' ? 'pptFile' :
                              activeFileTypeRef.current === 'DOC' ? 'docFile' : 'zipFile';
              return { ...l, [fileKey]: fileObj };
            }
            return l;
          })
        };
      })
    }));
  };

  const handleRemoveAttachment = (moduleId, lessonId, fileType) => {
    if (!window.confirm(`Delete this ${fileType} attachment?`)) return;
    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id === lessonId) {
                const fileKey = fileType === 'PDF' ? 'pdfFile' :
                                fileType === 'PPT' ? 'pptFile' :
                                fileType === 'DOC' ? 'docFile' : 'zipFile';
                return { ...l, [fileKey]: null };
              }
              return l;
            })
          };
        }
        return m;
      })
    }));
  };

  // Final Wizard Submission (Draft vs Published)
  const handleWizardSubmit = async (statusValue) => {
    const metadata = {
      title: courseData.title,
      description: courseData.description,
      category: courseData.category,
      coverImage: courseData.coverImage,
      instructor: courseData.instructor,
      duration: courseData.duration,
      level: courseData.level,
      language: courseData.language,
      status: statusValue
    };

    const validation = validateCourse(metadata);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setActiveStep(1); // Return to metadata error location
      return;
    }

    try {
      // Commit full populated course object to database
      const newCourse = await addCourse({
        ...metadata,
        curriculum: courseData.curriculum
      });

      // Redirect straight to newly generated courseDetails workspace!
      navigate(`/courses/${newCourse.id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to save course object.');
    }
  };

  // Animation Variant
  const slideVariants = {
    initial: { opacity: 0, x: 15 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -15 }
  };

  return (
    <div className="flex flex-col text-left mb-8 max-w-5xl mx-auto">
      <PageHeader
        title="Course Wizard Creation"
        subtitle="Onboarding wizard for metadata configs, collapsible modules, and attachment loaders."
        backUrl="/courses"
      />

      {/* Stepper Header Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-sm mb-6 select-none overflow-x-auto">
        <div className="flex items-center justify-between w-full min-w-[500px] px-2">
          {steps.map((st, i) => (
            <React.Fragment key={st.index}>
              <div className="flex items-center gap-2">
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors
                    ${activeStep === st.index 
                      ? 'bg-brand-600 text-white' 
                      : activeStep > st.index 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-100 text-slate-400'}`}
                >
                  {activeStep > st.index ? <Check size={13} /> : st.index}
                </div>
                <span className={`text-xs font-bold transition-all
                  ${activeStep === st.index ? 'text-brand-600' : 'text-slate-500'}`}
                >
                  {st.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-[1px] mx-4 min-w-[20px]
                  ${activeStep > st.index ? 'bg-emerald-300' : 'bg-slate-100'}`} 
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Wizard Form Panels */}
      <Card className="p-6 md:p-8 bg-white border border-slate-100 shadow-premium min-h-[420px] relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Basic Information */}
          {activeStep === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-5 text-left"
            >
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Sparkles size={16} className="text-brand-500" />
                <h3 className="text-sm font-bold text-slate-800">Step 1 – Basic Information</h3>
              </div>

              <Input
                label="Course Title"
                id="title"
                value={courseData.title}
                onChange={(e) => handleCourseChange('title', e.target.value)}
                placeholder="e.g. Master React & Redux Toolkit: Enterprise Suite"
                error={errors.title}
                required
              />

              <div className="flex flex-col w-full gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Course Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={courseData.description}
                  onChange={(e) => handleCourseChange('description', e.target.value)}
                  placeholder="Summarize course goals and curriculum content structure for student registers..."
                  rows={5}
                  className={`w-full text-sm py-2.5 px-3.5 rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all
                    ${errors.description 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/10'
                    }`}
                />
                {errors.description && <span className="text-xs text-red-500 font-medium">{errors.description}</span>}
              </div>

              <Select
                label="Category"
                id="category"
                options={CATEGORIES}
                value={courseData.category}
                onChange={(e) => handleCourseChange('category', e.target.value)}
                error={errors.category}
                required
              />
            </motion.div>
          )}

          {/* STEP 2: Course Details */}
          {activeStep === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-5 text-left"
            >
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Sparkles size={16} className="text-brand-500" />
                <h3 className="text-sm font-bold text-slate-800">Step 2 – Course Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Instructor Name"
                  id="instructor"
                  value={courseData.instructor}
                  onChange={(e) => handleCourseChange('instructor', e.target.value)}
                  error={errors.instructor}
                  required
                />
                <Input
                  label="Course Duration"
                  id="duration"
                  value={courseData.duration}
                  onChange={(e) => handleCourseChange('duration', e.target.value)}
                  placeholder="e.g. 16 Hours or 24 Lessons"
                  error={errors.duration}
                  required
                />
              </div>

              <Input
                label="Course Cover Image (URL)"
                id="coverImage"
                value={courseData.coverImage}
                onChange={(e) => handleCourseChange('coverImage', e.target.value)}
                placeholder="e.g. https://images.unsplash.com/photo-..."
                helperText="Provide an Unsplash cover url, or leave blank to auto-create gradients"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Level"
                  id="level"
                  options={LEVELS}
                  value={courseData.level}
                  onChange={(e) => handleCourseChange('level', e.target.value)}
                  required
                />
                <Select
                  label="Language"
                  id="language"
                  options={LANGUAGES}
                  value={courseData.language}
                  onChange={(e) => handleCourseChange('language', e.target.value)}
                  required
                />
                <Select
                  label="Initial status"
                  id="status"
                  options={STATUSES}
                  value={courseData.status}
                  onChange={(e) => handleCourseChange('status', e.target.value)}
                  required
                />
              </div>
            </motion.div>
          )}

          {/* STEP 3: Curriculum Learning Content Builder */}
          {activeStep === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-6 text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-brand-500" />
                  <h3 className="text-sm font-bold text-slate-800">Step 3 – Learning Content Curriculum</h3>
                </div>

                {!isAddingModuleInline ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAddingModuleInline(true)}
                    icon={Plus}
                    className="text-xs bg-brand-600 hover:bg-brand-700"
                  >
                    Add Module
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Module 1: Basics"
                      value={moduleInputTitle}
                      onChange={(e) => setModuleInputTitle(e.target.value)}
                      className="text-xs font-semibold py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
                    />
                    <Button variant="primary" size="sm" onClick={handleAddModuleInline} className="text-xs py-1.5 px-3">
                      Add
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsAddingModuleInline(false)} className="p-1.5 text-slate-400">
                      <X size={14} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Modules Accordion List */}
              {courseData.curriculum.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
                  <FolderDot size={28} className="text-slate-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-600">No modules in curriculum</h4>
                  <p className="text-[11px] text-slate-400">Start by creating Module 1 folders using the button above.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 select-none">
                  {courseData.curriculum.map((mod, modIdx) => {
                    const isModExpanded = expandedModules[mod.id];
                    return (
                      <Card key={mod.id} className="p-4 bg-white border border-slate-100 shadow-sm flex flex-col gap-3">
                        
                        {/* Module header bar */}
                        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setExpandedModules(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))}>
                            <span className="text-slate-400">
                              {isModExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </span>
                            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{mod.title}</span>
                          </div>

                          {/* Reordering and Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveModule(modIdx, 'up')}
                              disabled={modIdx === 0}
                              className="p-1 rounded text-slate-400 hover:bg-slate-50 disabled:opacity-30"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={() => handleMoveModule(modIdx, 'down')}
                              disabled={modIdx === courseData.curriculum.length - 1}
                              className="p-1 rounded text-slate-400 hover:bg-slate-50 disabled:opacity-30"
                            >
                              <ArrowDown size={12} />
                            </button>
                            <button
                              onClick={() => handleAddLessonInline(mod.id)}
                              className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg text-xs font-bold flex items-center gap-1 border border-brand-100 ml-2"
                            >
                              <Plus size={11} /> Add Lesson
                            </button>
                            <button
                              onClick={() => handleDeleteModule(mod.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded-lg ml-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Accordion Lessons list */}
                        {isModExpanded && (
                          <div className="flex flex-col gap-3 pl-4">
                            {mod.lessons.length === 0 ? (
                              <span className="text-[11px] text-slate-400 py-3 font-semibold">No lessons inside this module. Add one above!</span>
                            ) : (
                              mod.lessons.map((les, lesIdx) => {
                                const isLesExpanded = expandedLessons[les.id];
                                return (
                                  <div key={les.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20">
                                    
                                    {/* Lesson Title Header */}
                                    <div 
                                      className="p-3 bg-white hover:bg-slate-50/50 flex items-center justify-between cursor-pointer border-b border-slate-100/50"
                                      onClick={() => setExpandedLessons(prev => ({ ...prev, [les.id]: !prev[les.id] }))}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span className="text-slate-400">
                                          {isLesExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                        </span>
                                        <span className="text-xs font-bold text-slate-700">{les.title || 'Untitled Lesson'}</span>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleMoveLesson(mod.id, lesIdx, 'up'); }}
                                          disabled={lesIdx === 0}
                                          className="p-1 rounded text-slate-400 hover:bg-slate-50 disabled:opacity-30"
                                        >
                                          <ArrowUp size={11} />
                                        </button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleMoveLesson(mod.id, lesIdx, 'down'); }}
                                          disabled={lesIdx === mod.lessons.length - 1}
                                          className="p-1 rounded text-slate-400 hover:bg-slate-50 disabled:opacity-30"
                                        >
                                          <ArrowDown size={11} />
                                        </button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleDeleteLesson(mod.id, les.id); }}
                                          className="p-1 text-slate-400 hover:text-red-500 rounded-lg ml-2"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Expanded Lesson inputs editor */}
                                    {isLesExpanded && (
                                      <div className="p-4 bg-white flex flex-col gap-4 text-left border-t border-slate-50">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <Input
                                            label="Lesson Title"
                                            value={les.title}
                                            onChange={(e) => handleLessonFieldChange(mod.id, les.id, 'title', e.target.value)}
                                            placeholder="e.g. Lesson 1.1: Syntax Basics"
                                            required
                                          />
                                          <Input
                                            label="Video URL (YouTube, Animated, or Pre-recorded)"
                                            value={les.videoUrl}
                                            onChange={(e) => handleLessonFieldChange(mod.id, les.id, 'videoUrl', e.target.value)}
                                            placeholder="e.g. https://www.youtube.com/..."
                                          />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                          <label className="text-xs font-semibold text-slate-700">Lesson Description</label>
                                          <textarea
                                            value={les.description}
                                            onChange={(e) => handleLessonFieldChange(mod.id, les.id, 'description', e.target.value)}
                                            placeholder="Brief outlines of lesson curriculum concepts..."
                                            rows={2}
                                            className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
                                          />
                                        </div>

                                        {/* Drag and Drop Upload Attachments Zone */}
                                        <div className="flex flex-col gap-2">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">Upload Attachments</span>
                                          
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            
                                            {/* PDF Zone */}
                                            <div className="flex flex-col gap-1">
                                              <span className="text-[9px] font-bold text-slate-400 uppercase">PDF Notes</span>
                                              {les.pdfFile ? (
                                                <div className="p-2 border border-rose-100 rounded-xl bg-rose-50/20 flex items-center justify-between text-left">
                                                  <span className="text-[10px] font-bold text-rose-700 truncate max-w-[70%]">{les.pdfFile.name}</span>
                                                  <button type="button" onClick={() => handleRemoveAttachment(mod.id, les.id, 'PDF')} className="text-slate-400 hover:text-red-500">
                                                    <X size={12} />
                                                  </button>
                                                </div>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => triggerAttachmentUpload(les.id, 'PDF')}
                                                  className="border border-dashed border-slate-200 hover:border-brand-300 hover:bg-slate-50/50 p-3 py-4 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-brand-600 transition-all h-20"
                                                >
                                                  <FileText size={16} />
                                                  <span className="text-[9px] font-bold uppercase">Upload PDF</span>
                                                </button>
                                              )}
                                            </div>

                                            {/* PPT Zone */}
                                            <div className="flex flex-col gap-1">
                                              <span className="text-[9px] font-bold text-slate-400 uppercase">PPT Slides</span>
                                              {les.pptFile ? (
                                                <div className="p-2 border border-blue-100 rounded-xl bg-blue-50/20 flex items-center justify-between text-left">
                                                  <span className="text-[10px] font-bold text-blue-700 truncate max-w-[70%]">{les.pptFile.name}</span>
                                                  <button type="button" onClick={() => handleRemoveAttachment(mod.id, les.id, 'PPT')} className="text-slate-400 hover:text-red-500">
                                                    <X size={12} />
                                                  </button>
                                                </div>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => triggerAttachmentUpload(les.id, 'PPT')}
                                                  className="border border-dashed border-slate-200 hover:border-brand-300 hover:bg-slate-50/50 p-3 py-4 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-brand-600 transition-all h-20"
                                                >
                                                  <Presentation size={16} />
                                                  <span className="text-[9px] font-bold uppercase">Upload PPT</span>
                                                </button>
                                              )}
                                            </div>

                                            {/* DOC Zone */}
                                            <div className="flex flex-col gap-1">
                                              <span className="text-[9px] font-bold text-slate-400 uppercase">DOC Document</span>
                                              {les.docFile ? (
                                                <div className="p-2 border border-emerald-100 rounded-xl bg-emerald-50/20 flex items-center justify-between text-left">
                                                  <span className="text-[10px] font-bold text-emerald-700 truncate max-w-[70%]">{les.docFile.name}</span>
                                                  <button type="button" onClick={() => handleRemoveAttachment(mod.id, les.id, 'DOC')} className="text-slate-400 hover:text-red-500">
                                                    <X size={12} />
                                                  </button>
                                                </div>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => triggerAttachmentUpload(les.id, 'DOC')}
                                                  className="border border-dashed border-slate-200 hover:border-brand-300 hover:bg-slate-50/50 p-3 py-4 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-brand-600 transition-all h-20"
                                                >
                                                  <FileCode size={16} />
                                                  <span className="text-[9px] font-bold uppercase">Upload DOC</span>
                                                </button>
                                              )}
                                            </div>

                                            {/* ZIP Archive Zone */}
                                            <div className="flex flex-col gap-1">
                                              <span className="text-[9px] font-bold text-slate-400 uppercase">ZIP Archive</span>
                                              {les.zipFile ? (
                                                <div className="p-2 border border-purple-100 rounded-xl bg-purple-50/20 flex items-center justify-between text-left">
                                                  <span className="text-[10px] font-bold text-purple-700 truncate max-w-[70%]">{les.zipFile.name}</span>
                                                  <button type="button" onClick={() => handleRemoveAttachment(mod.id, les.id, 'ZIP')} className="text-slate-400 hover:text-red-500">
                                                    <X size={12} />
                                                  </button>
                                                </div>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => triggerAttachmentUpload(les.id, 'ZIP')}
                                                  className="border border-dashed border-slate-200 hover:border-brand-300 hover:bg-slate-50/50 p-3 py-4 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-brand-600 transition-all h-20"
                                                >
                                                  <Archive size={16} />
                                                  <span className="text-[9px] font-bold uppercase">Upload ZIP</span>
                                                </button>
                                              )}
                                            </div>

                                          </div>
                                        </div>

                                        {/* Mock upload progress inside current lesson */}
                                        {uploadState.isUploading && uploadState.lessonId === les.id && (
                                          <div className="p-3 bg-brand-50/30 border border-brand-100 rounded-xl flex flex-col gap-1.5 mt-2">
                                            <div className="flex justify-between items-center text-[9px] font-extrabold uppercase text-slate-500">
                                              <span>Uploading {uploadState.fileType} Handout: {uploadState.fileName}</span>
                                              <span>{uploadState.progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                              <div className="bg-brand-500 h-full" style={{ width: `${uploadState.progress}%` }} />
                                            </div>
                                          </div>
                                        )}

                                      </div>
                                    )}

                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}

                      </Card>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </Card>

      {/* Hidden File input picker */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleAttachmentFileSelected}
      />

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-0 inset-x-0 z-10 py-4 px-6 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-lg flex items-center justify-between gap-4 mt-4 select-none">
        <Button
          variant="secondary"
          onClick={() => navigate('/courses')}
          className="text-xs border-slate-200"
        >
          Cancel
        </Button>

        <div className="flex items-center gap-2">
          {activeStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="text-xs"
              icon={ArrowLeft}
            >
              Back
            </Button>
          )}

          {activeStep < 3 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              className="text-xs bg-brand-600 hover:bg-brand-700"
              icon={ArrowRight}
            >
              Next Step
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleWizardSubmit('Draft')}
                className="text-xs font-bold"
              >
                Save as Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => handleWizardSubmit('Published')}
                className="text-xs bg-brand-600 hover:bg-brand-700"
                icon={Save}
              >
                Publish Course
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
