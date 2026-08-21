import { useState, useEffect, useCallback } from 'react';
import { courseService } from '../services/courseService';

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    try {
      const data = courseService.getCourses();
      setCourses(data);
      setError(null);
    } catch (e) {
      setError('Failed to load courses.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const addCourse = async (courseData) => {
    try {
      const newCourse = courseService.createCourse(courseData);
      setCourses(prev => [...prev, newCourse]);
      return newCourse;
    } catch (e) {
      setError('Failed to create course.');
      throw e;
    }
  };

  const updateCourse = async (id, courseData) => {
    try {
      const updated = courseService.updateCourse(id, courseData);
      setCourses(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (e) {
      setError('Failed to update course.');
      throw e;
    }
  };

  const deleteCourse = async (id) => {
    try {
      courseService.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (e) {
      setError('Failed to delete course.');
      throw e;
    }
  };

  return {
    courses,
    loading,
    error,
    refreshCourses: fetchCourses,
    addCourse,
    updateCourse,
    deleteCourse
  };
};
