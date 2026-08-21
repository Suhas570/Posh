import { courseService } from './courseService';
import { generateId } from '../utils/helpers';

export const resourceService = {
  // Get all resources for a course
  getResources: (courseId) => {
    const course = courseService.getCourseById(courseId);
    return course?.learningContent?.resources || [];
  },

  // Add resource to course
  addResource: (courseId, resourceData) => {
    const course = courseService.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    const newResource = {
      ...resourceData,
      id: generateId('res')
    };

    if (!course.learningContent) course.learningContent = {};
    if (!course.learningContent.resources) course.learningContent.resources = [];

    course.learningContent.resources.push(newResource);
    courseService.updateCourse(courseId, course);

    courseService.addActivity({
      type: 'resource',
      text: `You added resource "${newResource.title}" to "${course.title}"`,
      courseId
    });

    return newResource;
  },

  // Update resource in course
  updateResource: (courseId, resourceId, resourceData) => {
    const course = courseService.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    const resources = course.learningContent?.resources || [];
    const index = resources.findIndex(r => r.id === resourceId);
    if (index === -1) throw new Error('Resource not found');

    const updatedResource = {
      ...resources[index],
      ...resourceData
    };

    resources[index] = updatedResource;
    course.learningContent.resources = resources;
    courseService.updateCourse(courseId, course);

    courseService.addActivity({
      type: 'resource',
      text: `You updated resource "${updatedResource.title}" in "${course.title}"`,
      courseId
    });

    return updatedResource;
  },

  // Delete resource from course
  deleteResource: (courseId, resourceId) => {
    const course = courseService.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    const resources = course.learningContent?.resources || [];
    const resource = resources.find(r => r.id === resourceId);
    const filtered = resources.filter(r => r.id !== resourceId);

    course.learningContent.resources = filtered;
    courseService.updateCourse(courseId, course);

    if (resource) {
      courseService.addActivity({
        type: 'resource',
        text: `You deleted resource "${resource.title}" from "${course.title}"`,
        courseId
      });
    }

    return true;
  }
};
