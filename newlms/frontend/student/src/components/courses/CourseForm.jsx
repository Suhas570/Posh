import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, LEVELS, LANGUAGES, STATUSES } from '../../utils/constants';
import { validateCourse } from '../../utils/validators';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';
import { Check, Loader2, Sparkles } from 'lucide-react';

const CourseForm = ({ initialData, onSubmit, submitText = 'Save Course' }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    coverImage: '',
    instructor: 'Manoj', // Default
    duration: '',
    level: 'Beginner',
    language: 'English',
    status: 'Draft',
    ...initialData
  });

  const [activeStep, setActiveStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState(null);

  // Auto save simulator
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title) {
        setIsAutoSaving(true);
        setTimeout(() => {
          setIsAutoSaving(false);
          setLastAutoSaved(new Date().toLocaleTimeString());
        }, 1000);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      // Validate step 1 fields
      const step1Fields = {
        title: formData.title,
        description: formData.description,
        category: formData.category
      };
      const validation = validateCourse({ ...formData, ...step1Fields });
      const newErrors = {};
      if (!formData.title) newErrors.title = 'Title is required';
      if (!formData.description) newErrors.description = 'Description is required';
      if (!formData.category) newErrors.category = 'Category is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }
    setActiveStep(prev => Math.min(prev + 1, 2));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateCourse(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Jump to step with error
      const step1HasError = validation.errors.title || validation.errors.description || validation.errors.category;
      if (step1HasError) {
        setActiveStep(1);
      } else {
        setActiveStep(2);
      }
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(formData);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl text-left">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between bg-white border border-slate-100 p-5 rounded-2xl shadow-sm mb-2">
        <div className="flex items-center gap-8 w-full">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors
              ${activeStep === 1 
                ? 'bg-brand-600 text-white' 
                : activeStep > 1 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-100 text-slate-400'}`}
            >
              {activeStep > 1 ? <Check size={14} /> : '1'}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800">Basic Information</span>
              <span className="text-[10px] text-slate-400 font-semibold">Title, Category, Details</span>
            </div>
          </div>
          
          <div className="flex-1 h-[1px] bg-slate-100" />
          
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors
              ${activeStep === 2 
                ? 'bg-brand-600 text-white' 
                : 'bg-slate-100 text-slate-400'}`}
            >
              2
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800">Course Details</span>
              <span className="text-[10px] text-slate-400 font-semibold">Instructor, Status, Media</span>
            </div>
          </div>
        </div>

        {/* Auto Save indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 flex-shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          {isAutoSaving ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-brand-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Auto saving...</span>
            </>
          ) : lastAutoSaved ? (
            <span>Saved at {lastAutoSaved}</span>
          ) : (
            <span>Auto save active</span>
          )}
        </div>
      </div>

      {/* Steps Content */}
      <Card className="p-6 md:p-8 flex flex-col gap-5">
        {activeStep === 1 && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles size={16} className="text-brand-500" />
              <h3 className="text-sm font-bold text-slate-800">Basic Information</h3>
            </div>
            
            <Input
              label="Course Title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Master React & Tailwind CSS from Scratch"
              error={errors.title}
              required
            />
            
            <div className="flex flex-col w-full gap-1.5">
              <label htmlFor="description" className="text-xs font-semibold text-slate-700">
                Course Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Give a brief summary of what students will learn in this course..."
                rows={5}
                className={`w-full text-sm py-2.5 px-3.5 rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all
                  ${errors.description 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                    : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/10'
                  }`}
              />
              {errors.description && (
                <span className="text-xs text-red-500 font-medium">{errors.description}</span>
              )}
            </div>

            <Select
              label="Category"
              id="category"
              options={CATEGORIES}
              value={formData.category}
              onChange={handleChange}
              placeholder="Select course category"
              error={errors.category}
              required
            />
          </div>
        )}

        {activeStep === 2 && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles size={16} className="text-brand-500" />
              <h3 className="text-sm font-bold text-slate-800">Course Details & Media</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Instructor Name"
                id="instructor"
                value={formData.instructor}
                onChange={handleChange}
                placeholder="e.g. Manoj"
                error={errors.instructor}
                required
              />
              
              <Input
                label="Course Duration"
                id="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g. 24 Hours or 15 Lessons"
                error={errors.duration}
                required
              />
            </div>

            <Input
              label="Course Cover Image (URL)"
              id="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="e.g. https://images.unsplash.com/photo-..."
              error={errors.coverImage}
              helperText="Provide a valid Unsplash image URL or leave blank to auto-generate a color gradient"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Level"
                id="level"
                options={LEVELS}
                value={formData.level}
                onChange={handleChange}
                error={errors.level}
                required
              />
              
              <Select
                label="Language"
                id="language"
                options={LANGUAGES}
                value={formData.language}
                onChange={handleChange}
                error={errors.language}
                required
              />

              <Select
                label="Status"
                id="status"
                options={STATUSES}
                value={formData.status}
                onChange={handleChange}
                error={errors.status}
                required
              />
            </div>
          </div>
        )}
      </Card>

      {/* Sticky Save / Navigation Button Bar at the bottom */}
      <div className="sticky bottom-0 inset-x-0 z-10 py-4 px-6 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-lg flex items-center justify-between gap-4 mt-4">
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
            >
              Back
            </Button>
          )}

          {activeStep < 2 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              className="text-xs"
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              className="text-xs"
            >
              {submitText}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default CourseForm;
