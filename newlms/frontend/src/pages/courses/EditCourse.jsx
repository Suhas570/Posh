import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCourses } from '../../hooks/useCourses';
import { courseService } from '../../services/courseService';
import PageHeader from '../../components/common/PageHeader';
import CourseForm from '../../components/courses/CourseForm';
import Loader from '../../components/common/Loader';

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { updateCourse } = useCourses();

  // Load specific course
  const course = courseService.getCourseById(id);

  const handleSave = async (courseData) => {
    try {
      await updateCourse(id, courseData);
      navigate('/courses');
    } catch (e) {
      console.error(e);
    }
  };

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-left">
        <h2 className="text-base font-bold text-slate-800 mb-1">Course Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">The course you are looking to edit doesn't exist.</p>
        <button 
          onClick={() => navigate('/courses')}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col text-left"
    >
      <PageHeader
        title="Edit Course Information"
        subtitle={`Modify configurations for "${course.title}".`}
        backUrl="/courses"
      />

      <div className="mb-8">
        <CourseForm
          initialData={course}
          onSubmit={handleSave}
          submitText="Update Course"
        />
      </div>
    </motion.div>
  );
};

export default EditCourse;
