import axios from 'axios';
import { 
  SAMPLE_COURSES, 
  MOCK_ACTIVITIES, 
  SAMPLE_REVIEWS, 
  SAMPLE_MESSAGES, 
  SAMPLE_ANNOUNCEMENTS, 
  SAMPLE_CALENDAR_EVENTS 
} from '../utils/constants';
import { generateId } from '../utils/helpers';

const COURSES_KEY = 'tutor_lms_courses';
const ACTIVITIES_KEY = 'tutor_lms_activities';
const REVIEWS_KEY = 'tutor_lms_reviews';
const MESSAGES_KEY = 'tutor_lms_messages';
const ANNOUNCEMENTS_KEY = 'tutor_lms_announcements';
const CALENDAR_KEY = 'tutor_lms_calendar';

const API_BASE = 'http://localhost:5000/api';

const initStorage = () => {
  if (!localStorage.getItem(COURSES_KEY)) {
    localStorage.setItem(COURSES_KEY, JSON.stringify(SAMPLE_COURSES));
  }
  if (!localStorage.getItem(ACTIVITIES_KEY)) {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(MOCK_ACTIVITIES));
  }
  if (!localStorage.getItem(REVIEWS_KEY)) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(SAMPLE_REVIEWS));
  }
  if (!localStorage.getItem(MESSAGES_KEY)) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(SAMPLE_MESSAGES));
  }
  if (!localStorage.getItem(ANNOUNCEMENTS_KEY)) {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(SAMPLE_ANNOUNCEMENTS));
  }
  if (!localStorage.getItem(CALENDAR_KEY)) {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(SAMPLE_CALENDAR_EVENTS));
  }
};

initStorage();

// Background Sync Helper
const syncFromBackend = async (key, endpoint) => {
  try {
    const response = await axios.get(`${API_BASE}${endpoint}`);
    if (response.data && Array.isArray(response.data)) {
      // Map Prisma MongoDB "_id" field back to the frontend expected "id" parameter
      const normalizedData = response.data.map(item => {
        if (item.id && !item._id) return item;
        return { ...item, id: item.id || item._id };
      });
      localStorage.setItem(key, JSON.stringify(normalizedData));
    }
  } catch (error) {
    console.debug(`[Sync] Failed to sync ${key} from backend:`, error.message);
  }
};

// Fire initial background sync
const startInitialSync = () => {
  syncFromBackend(COURSES_KEY, '/courses');
  syncFromBackend(ACTIVITIES_KEY, '/activities');
  syncFromBackend(REVIEWS_KEY, '/reviews');
  syncFromBackend(MESSAGES_KEY, '/messages');
  syncFromBackend(ANNOUNCEMENTS_KEY, '/announcements');
  syncFromBackend(CALENDAR_KEY, '/calendar');
};

// Run initial sync on load
startInitialSync();

export const courseService = {
  // Courses CRUD
  getCourses: () => {
    initStorage();
    // Run a background sync to refresh cache for next load
    syncFromBackend(COURSES_KEY, '/courses');
    try {
      return JSON.parse(localStorage.getItem(COURSES_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  getCourseById: (id) => {
    const courses = courseService.getCourses();
    return courses.find(c => c.id === id) || null;
  },

  createCourse: (courseData) => {
    const courses = courseService.getCourses();
    const newCourse = {
      ...courseData,
      id: generateId('course'),
      createdAt: new Date().toISOString(),
      curriculum: courseData.curriculum || []
    };
    
    // Save locally
    courses.push(newCourse);
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    
    courseService.addActivity({
      type: 'course',
      text: `You created a new course "${newCourse.title}"`,
      courseId: newCourse.id
    });

    // Save to backend database asynchronously
    axios.post(`${API_BASE}/courses`, newCourse)
      .then(res => {
        // Sync local storage with DB response (e.g. to catch MongoDB ObjectId maps)
        if (res.data) {
          const updatedCourses = courseService.getCourses().map(c => 
            c.title === newCourse.title ? { ...res.data, id: res.data.id || res.data._id } : c
          );
          localStorage.setItem(COURSES_KEY, JSON.stringify(updatedCourses));
        }
      })
      .catch(err => console.error('[Backend] Failed to persist new course:', err.message));

    return newCourse;
  },

  updateCourse: (id, courseData) => {
    const courses = courseService.getCourses();
    const index = courses.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Course not found');
    
    const updated = {
      ...courses[index],
      ...courseData
    };
    
    // Save locally
    courses[index] = updated;
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));

    // Save to backend database asynchronously
    axios.put(`${API_BASE}/courses/${id}`, updated)
      .catch(err => console.error('[Backend] Failed to update course:', err.message));

    return updated;
  },

  deleteCourse: (id) => {
    const courses = courseService.getCourses();
    const course = courses.find(c => c.id === id);
    const filtered = courses.filter(c => c.id !== id);
    
    // Save locally
    localStorage.setItem(COURSES_KEY, JSON.stringify(filtered));
    
    if (course) {
      courseService.addActivity({
        type: 'course',
        text: `You deleted course "${course.title}"`,
        courseId: null
      });
    }

    // Delete from backend database asynchronously
    axios.delete(`${API_BASE}/courses/${id}`)
      .catch(err => console.error('[Backend] Failed to delete course:', err.message));

    return true;
  },

  // Activities logs
  getActivities: () => {
    syncFromBackend(ACTIVITIES_KEY, '/activities');
    try {
      return JSON.parse(localStorage.getItem(ACTIVITIES_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  addActivity: (activity) => {
    let newActivity;
    try {
      const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY)) || [];
      newActivity = {
        id: generateId('act'),
        time: 'Just now',
        ...activity
      };
      const updated = [newActivity, ...activities].slice(0, 15);
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
    } catch (e) {}

    // Post to backend database asynchronously
    if (newActivity) {
      axios.post(`${API_BASE}/activities`, newActivity)
        .catch(err => console.error('[Backend] Failed to save activity log:', err.message));
    }
    return newActivity;
  },

  // Reviews CRUD
  getReviews: () => {
    initStorage();
    syncFromBackend(REVIEWS_KEY, '/reviews');
    try {
      return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  updateReviewReply: (reviewId, replyText) => {
    const reviews = courseService.getReviews();
    const index = reviews.findIndex(r => r.id === reviewId);
    if (index === -1) return;
    
    reviews[index].reply = replyText;
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

    // Put to backend database asynchronously
    axios.put(`${API_BASE}/reviews/${reviewId}/reply`, { replyText })
      .catch(err => console.error('[Backend] Failed to save review reply:', err.message));

    return reviews[index];
  },

  // Messages CRUD
  getMessages: () => {
    initStorage();
    syncFromBackend(MESSAGES_KEY, '/messages');
    try {
      return JSON.parse(localStorage.getItem(MESSAGES_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  sendMessage: (msgData) => {
    const msgs = courseService.getMessages();
    const newMsg = {
      id: generateId('msg'),
      sender: 'You',
      subject: msgData.subject,
      preview: msgData.text.slice(0, 80) + '...',
      date: 'Just now',
      unread: false,
      folder: 'Sent',
      thread: [
        { sender: 'You', text: msgData.text, time: 'Just now' }
      ]
    };
    
    msgs.push(newMsg);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs));

    // Post to backend database asynchronously
    axios.post(`${API_BASE}/messages`, newMsg)
      .catch(err => console.error('[Backend] Failed to send message:', err.message));

    return newMsg;
  },

  // Announcements CRUD
  getAnnouncements: () => {
    initStorage();
    syncFromBackend(ANNOUNCEMENTS_KEY, '/announcements');
    try {
      return JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  createAnnouncement: (annData) => {
    const anns = courseService.getAnnouncements();
    const newAnn = {
      id: generateId('ann'),
      title: annData.title,
      content: annData.content,
      target: annData.target,
      courseId: annData.courseId || null,
      courseTitle: annData.courseTitle || '',
      date: new Date().toISOString().split('T')[0],
      files: annData.files || []
    };
    
    anns.push(newAnn);
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(anns));
    
    // Add upload activity
    courseService.addActivity({
      type: 'announcement',
      text: `You created a new announcement: "${newAnn.title}"`,
      courseId: newAnn.courseId
    });

    // Post to backend database asynchronously
    axios.post(`${API_BASE}/announcements`, newAnn)
      .catch(err => console.error('[Backend] Failed to create announcement:', err.message));
    
    return newAnn;
  },

  // Calendar CRUD
  getCalendarEvents: () => {
    initStorage();
    syncFromBackend(CALENDAR_KEY, '/calendar');
    try {
      return JSON.parse(localStorage.getItem(CALENDAR_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  addCalendarEvent: (evData) => {
    const evs = courseService.getCalendarEvents();
    const newEv = {
      id: generateId('ev'),
      ...evData
    };
    
    evs.push(newEv);
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(evs));

    // Post to backend database asynchronously
    axios.post(`${API_BASE}/calendar`, newEv)
      .catch(err => console.error('[Backend] Failed to schedule calendar event:', err.message));

    return newEv;
  }
};

export default courseService;
