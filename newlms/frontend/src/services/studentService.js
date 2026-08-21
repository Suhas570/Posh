import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/student';

// Use standard local storage namespace for student state
const STORAGE_KEYS = {
  ENROLLMENTS: 'student_lms_enrollments',
  COMPLETED_LESSONS: 'student_lms_completed_lessons',
  NOTIFICATIONS: 'student_lms_notifications',
  MESSAGES: 'student_lms_messages',
};

// Seed initial mock enrollments if not present
const initLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.ENROLLMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS)) {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify({}));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([
      { id: '1', title: 'New Course Published', desc: 'Manoj published a new course: Advanced React Development', time: '2 hours ago', unread: true },
      { id: '2', title: 'Welcome to Tutor LMS', desc: 'Start browsing courses and begin your learning journey!', time: '1 day ago', unread: false },
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([
      {
        id: '1',
        sender: 'Manoj',
        recipient: 'Student',
        subject: 'React Basics Query',
        preview: 'Hi Manoj, please let me know when you release the modules on context hooks...',
        date: 'Today, 2:30 PM',
        unread: false,
        thread: [
          { sender: 'Student', text: 'Hi Manoj, please let me know when you release the modules on context hooks...', time: 'Today, 2:20 PM' },
          { sender: 'Manoj', text: 'Hi! Those lessons are already uploaded. Check Module 2!', time: 'Today, 2:30 PM' }
        ]
      }
    ]));
  }
};

initLocalStorage();

export const studentService = {
  // Fetch published courses
  getBrowseCourses: async () => {
    try {
      const res = await axios.get(`${API_BASE}/courses`);
      return res.data;
    } catch (error) {
      console.warn('API error fetching student courses, fallback to mock...', error);
      // Fallback: Read mock data if backend fails
      const fallbackCourses = JSON.parse(localStorage.getItem('tutor_lms_courses') || '[]');
      return fallbackCourses;
    }
  },

  // Get specific course detail
  getCourseDetails: async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/courses/${id}`);
      return res.data;
    } catch (error) {
      console.warn('API error fetching course details, fallback...', error);
      const courses = JSON.parse(localStorage.getItem('tutor_lms_courses') || '[]');
      return courses.find(c => c.id === id);
    }
  },

  // Get enrolled courses
  getEnrolledCourses: async () => {
    const enrollments = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENROLLMENTS) || '[]');
    const courses = await studentService.getBrowseCourses();
    
    // Map enrollments to actual course objects and merge local progress
    return enrollments.map(enroll => {
      const course = courses.find(c => c.id === enroll.courseId);
      if (!course) return null;
      
      const progress = studentService.getCourseProgress(enroll.courseId, course.curriculum);
      return {
        ...course,
        progress,
        lastLessonId: enroll.lastLessonId,
        enrolledAt: enroll.enrolledAt
      };
    }).filter(Boolean);
  },

  // Enroll in a course
  enrollInCourse: async (courseId) => {
    const enrollments = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENROLLMENTS) || '[]');
    if (enrollments.some(e => e.courseId === courseId)) return;
    
    enrollments.push({
      courseId,
      enrolledAt: new Date().toISOString(),
      lastLessonId: null
    });
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));

    // Post to shared activities feed
    axios.post('http://localhost:5000/api/activities', {
      type: 'course',
      text: `Student Manoj enrolled in course: ID ${courseId.slice(-6)}`,
      courseId
    }).catch(err => console.debug('[Activity] Failed to post enrollment log:', err.message));
  },

  // Get local course progress percentage
  getCourseProgress: (courseId, curriculum) => {
    const completed = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS) || '{}');
    const courseCompletions = completed[courseId] || [];
    
    const safeCurriculum = Array.isArray(curriculum) ? curriculum : [];
    let totalLessons = 0;
    safeCurriculum.forEach(mod => {
      if (mod && Array.isArray(mod.lessons)) {
        totalLessons += mod.lessons.length;
      }
    });

    if (totalLessons === 0) return 0;
    const completedCount = courseCompletions.length;
    return Math.round((completedCount / totalLessons) * 100);
  },

  // Toggle completed status for a lesson
  toggleLessonComplete: (courseId, lessonId) => {
    const completed = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS) || '{}');
    if (!completed[courseId]) {
      completed[courseId] = [];
    }

    const index = completed[courseId].indexOf(lessonId);
    let isAdded = false;
    if (index === -1) {
      completed[courseId].push(lessonId);
      isAdded = true;
    } else {
      completed[courseId].splice(index, 1);
    }

    localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify(completed));

    // Post to shared activities feed
    if (isAdded) {
      axios.post('http://localhost:5000/api/activities', {
        type: 'course',
        text: `Student Manoj completed lesson in course: ID ${courseId.slice(-6)}`,
        courseId
      }).catch(err => console.debug('[Activity] Failed to post completed lesson log:', err.message));
    }

    return completed[courseId].includes(lessonId);
  },

  // Check if a lesson is completed
  isLessonCompleted: (courseId, lessonId) => {
    const completed = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS) || '{}');
    const courseCompletions = completed[courseId] || [];
    return courseCompletions.includes(lessonId);
  },

  // Mock Announcements
  getAnnouncements: async () => {
    try {
      const res = await axios.get(`${API_BASE}/announcements`);
      return res.data;
    } catch (e) {
      return [];
    }
  },

  // Mock Calendar events
  getCalendarEvents: async () => {
    try {
      const res = await axios.get(`${API_BASE}/calendar`);
      return res.data;
    } catch (e) {
      return [];
    }
  },

  // Direct API Messages
  getMessages: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/messages');
      return res.data;
    } catch (e) {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
    }
  },

  sendMessage: async (id, text) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/messages/${id}/reply`, {
        text,
        sender: 'Student'
      });
      // Return updated list
      const list = await studentService.getMessages();
      return list;
    } catch (e) {
      console.warn('Failed to reply via API, fallback...', e);
      const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
      const active = messages.find(m => m.id === id);
      if (active) {
        active.thread.push({
          sender: 'Student',
          text,
          time: 'Just now'
        });
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
      }
      return messages;
    }
  },

  // Mock profile data
  getProfile: async () => {
    try {
      const res = await axios.get(`${API_BASE}/profile`);
      return res.data;
    } catch (e) {
      return {
        name: 'Manoj',
        email: 'student@lms.com',
        phone: '+1 234 567 890',
        bio: 'Curious learner focusing on computer science, AI, and design systems.',
        interests: ['Full Stack Web Development', 'UI/UX Design', 'Database Systems'],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
      };
    }
  }
};
