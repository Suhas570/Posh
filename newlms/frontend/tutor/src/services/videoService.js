import { courseService } from './courseService';
import { generateId } from '../utils/helpers';

export const videoService = {
  // Get all videos for a course
  getVideos: (courseId) => {
    const course = courseService.getCourseById(courseId);
    return course?.learningContent?.videos || [];
  },

  // Add video to course
  addVideo: (courseId, videoData) => {
    const course = courseService.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    const newVideo = {
      ...videoData,
      id: generateId('vid'),
      status: videoData.status || 'Active'
    };

    if (!course.learningContent) course.learningContent = {};
    if (!course.learningContent.videos) course.learningContent.videos = [];

    course.learningContent.videos.push(newVideo);
    courseService.updateCourse(courseId, course);

    courseService.addActivity({
      type: 'video',
      text: `You added video "${newVideo.title}" to "${course.title}"`,
      courseId
    });

    return newVideo;
  },

  // Update video in course
  updateVideo: (courseId, videoId, videoData) => {
    const course = courseService.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    const videos = course.learningContent?.videos || [];
    const index = videos.findIndex(v => v.id === videoId);
    if (index === -1) throw new Error('Video not found');

    const updatedVideo = {
      ...videos[index],
      ...videoData
    };

    videos[index] = updatedVideo;
    course.learningContent.videos = videos;
    courseService.updateCourse(courseId, course);

    courseService.addActivity({
      type: 'video',
      text: `You updated video "${updatedVideo.title}" in "${course.title}"`,
      courseId
    });

    return updatedVideo;
  },

  // Delete video from course
  deleteVideo: (courseId, videoId) => {
    const course = courseService.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    const videos = course.learningContent?.videos || [];
    const video = videos.find(v => v.id === videoId);
    const filtered = videos.filter(v => v.id !== videoId);

    course.learningContent.videos = filtered;
    courseService.updateCourse(courseId, course);

    if (video) {
      courseService.addActivity({
        type: 'video',
        text: `You deleted video "${video.title}" from "${course.title}"`,
        courseId
      });
    }

    return true;
  }
};
