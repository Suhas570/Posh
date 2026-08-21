import { Router } from 'express';
import prisma from '../../db';
import fs from 'fs';
import path from 'path';

const router = Router();

const localCachePath = path.join(__dirname, '../../../data/courses.json');

const INITIAL_SAMPLE_COURSES = [
  {
    id: 'course-1',
    title: 'React Development Masterclass',
    description: 'Learn modern React including Hooks, Context API, Redux Toolkit, and performance optimizations. Build real-world projects.',
    category: 'Development',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop',
    instructor: 'Manoj',
    duration: '24 Hours',
    level: 'Intermediate',
    language: 'English',
    status: 'Published',
    createdAt: '2026-06-15T09:00:00Z',
    curriculum: [
      {
        id: 'mod-1',
        title: 'Module 1: Getting Started with React',
        lessons: [
          {
            id: 'les-1-1',
            title: 'Lesson 1.1: Introduction to JSX Markup',
            videoUrl: 'https://www.youtube.com/watch?v=Dp1VjR1wWkU',
            videoType: 'YouTube',
            videoDuration: '15 mins',
            description: 'Learn the fundamentals of JSX, compiling HTML syntax elements in JS code.',
            pdfFile: { name: 'jsx_syntax_handout.pdf', size: '1.2 MB', url: 'http://localhost:5000/uploads/pdf/jsx_syntax_handout.pdf' },
            pptFile: { name: 'jsx_basics_deck.pptx', size: '3.4 MB', url: 'http://localhost:5000/uploads/ppt/jsx_basics_deck.pptx' },
            resources: [
              { id: 'res-1-1-1', title: 'React JSX Official Guidelines', url: 'https://react.dev', type: 'Documentation', description: 'React documentation on writing markup' }
            ]
          }
        ]
      }
    ]
  }
];

const saveLocalCourses = (courses: any[]) => {
  try {
    const dir = path.dirname(localCachePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(localCachePath, JSON.stringify(courses, null, 2));
  } catch (e) {}
};

const getLocalCourses = (): any[] => {
  try {
    if (fs.existsSync(localCachePath)) {
      const data = JSON.parse(fs.readFileSync(localCachePath, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {}
  saveLocalCourses(INITIAL_SAMPLE_COURSES);
  return INITIAL_SAMPLE_COURSES;
};

// GET /api/student/courses - Get all published courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany();
    const local = getLocalCourses();
    const mergedMap = new Map();
    [...courses, ...local].forEach(c => {
      if (c && c.id && !mergedMap.has(c.id)) {
        mergedMap.set(c.id, c);
      }
    });
    res.json(Array.from(mergedMap.values()));
  } catch (error: any) {
    console.warn('[DB Fallback] Prisma student courses GET failed, using local cache');
    res.json(getLocalCourses());
  }
});

// GET /api/student/courses/:id - Get details for a course
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (course) return res.json(course);
  } catch (error: any) {}

  const local = getLocalCourses();
  const match = local.find(c => c.id === req.params.id);
  if (match) return res.json(match);
  res.status(404).json({ error: 'Course not found' });
});

// Mock endpoints for announcements
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany();
    res.json(announcements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mock endpoints for calendar events
router.get('/calendar', async (req, res) => {
  try {
    const events = await prisma.calendarEvent.findMany();
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mock endpoints for messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany();
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/student/assignments - Get all published voice assignments for student dashboard
router.get('/assignments', async (req, res) => {
  try {
    const dbAssignments = await (prisma as any).voiceAssignment.findMany();
    const localAssignmentsPath = path.join(__dirname, '../../../data/voice_assignments.json');
    let localAssignments: any[] = [];
    if (fs.existsSync(localAssignmentsPath)) {
      localAssignments = JSON.parse(fs.readFileSync(localAssignmentsPath, 'utf-8'));
    }

    const mergedMap = new Map();
    [...dbAssignments, ...localAssignments].forEach(item => {
      const s = (item.status || 'Published').toLowerCase();
      if (item && item.id && (s === 'published' || s === 'active') && !mergedMap.has(item.id)) {
        mergedMap.set(item.id, item);
      }
    });

    res.json(Array.from(mergedMap.values()));
  } catch (error) {
    const localAssignmentsPath = path.join(__dirname, '../../../data/voice_assignments.json');
    let localAssignments: any[] = [];
    if (fs.existsSync(localAssignmentsPath)) {
      localAssignments = JSON.parse(fs.readFileSync(localAssignmentsPath, 'utf-8'));
    }
    res.json(localAssignments.filter((a: any) => {
      const s = (a.status || 'Published').toLowerCase();
      return s === 'published' || s === 'active';
    }));
  }
});

// Mock endpoints for profile
router.get('/profile', (req, res) => {
  res.json({
    name: 'Manoj',
    email: 'student@lms.com',
    phone: '+1 234 567 890',
    bio: 'Curious learner focusing on computer science, AI, and design systems.',
    interests: ['Full Stack Web Development', 'UI/UX Design', 'Database Systems'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  });
});

export default router;
