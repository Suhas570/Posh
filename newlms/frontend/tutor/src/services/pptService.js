import { courseService } from './courseService';
import { generateId } from '../utils/helpers';

export const pptService = {
  // Get all PPTs for a course
  getPPTs: (courseId) => {
    const course = courseService.getCourseById(courseId);
    return course?.learningContent?.ppts || [];
  },

  // Add PPT to course
  addPPT: (courseId, pptData) => {
    const course = courseService.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    const newPPT = {
      ...pptData,
      id: generateId('ppt')
    };

    if (!course.learningContent) course.learningContent = {};
    if (!course.learningContent.ppts) course.learningContent.ppts = [];

    course.learningContent.ppts.push(newPPT);
    courseService.updateCourse(courseId, course);

    courseService.addActivity({
      type: 'note',
      text: `You uploaded PPT "${newPPT.title}" for "${course.title}"`,
      courseId
    });

    return newPPT;
  },

  // Update PPT in course
  updatePPT: (courseId, pptId, pptData) => {
    const course = courseService.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    const ppts = course.learningContent?.ppts || [];
    const index = ppts.findIndex(p => p.id === pptId);
    if (index === -1) throw new Error('PPT not found');

    const updatedPPT = {
      ...ppts[index],
      ...pptData
    };

    ppts[index] = updatedPPT;
    course.learningContent.ppts = ppts;
    courseService.updateCourse(courseId, course);

    courseService.addActivity({
      type: 'note',
      text: `You updated PPT "${updatedPPT.title}" for "${course.title}"`,
      courseId
    });

    return updatedPPT;
  },

  // Delete PPT from course
  deletePPT: (courseId, pptId) => {
    const course = courseService.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    const ppts = course.learningContent?.ppts || [];
    const ppt = ppts.find(p => p.id === pptId);
    const filtered = ppts.filter(p => p.id !== pptId);

    course.learningContent.ppts = filtered;
    courseService.updateCourse(courseId, course);

    if (ppt) {
      courseService.addActivity({
        type: 'note',
        text: `You deleted PPT "${ppt.title}" from "${course.title}"`,
        courseId
      });
    }

    return true;
  }
};
