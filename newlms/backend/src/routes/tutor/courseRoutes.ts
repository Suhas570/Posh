import { Router, Request, Response } from 'express';
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

const saveLocalCourses = (courses: any[]) => {
  try {
    const dir = path.dirname(localCachePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(localCachePath, JSON.stringify(courses, null, 2));
  } catch (e) {}
};

// GET /api/courses
router.get('/', async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' }
    });
    if (courses && courses.length > 0) {
      saveLocalCourses(courses);
    }
    const local = getLocalCourses();
    const mergedMap = new Map();
    [...courses, ...local].forEach(c => {
      if (c && c.id && !mergedMap.has(c.id)) {
        mergedMap.set(c.id, c);
      }
    });
    res.json(Array.from(mergedMap.values()));
  } catch (error: any) {
    console.warn('[DB Fallback] Prisma GET query failed, using local cache');
    res.json(getLocalCourses());
  }
});

// GET /api/courses/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id }
    });
    if (course) return res.json(course);
  } catch (error: any) {}

  const local = getLocalCourses();
  const match = local.find(c => c.id === req.params.id);
  if (match) return res.json(match);
  res.status(404).json({ error: 'Course not found' });
});

// POST /api/courses
router.post('/', async (req: Request, res: Response) => {
  const { id, title, description, category, coverImage, instructor, duration, level, language, status, curriculum } = req.body;
  const courseObj = {
    id: id || `course-${Math.random().toString(36).substr(2, 9)}`,
    title: title || '',
    description: description || '',
    category: category || 'Development',
    coverImage: coverImage || '',
    instructor: instructor || 'Manoj',
    duration: duration || '',
    level: level || 'Beginner',
    language: language || 'English',
    status: status || 'Published',
    curriculum: curriculum || [],
    createdAt: new Date().toISOString()
  };

  // Persist locally first for zero-latency response
  const local = getLocalCourses();
  const idx = local.findIndex((c: any) => c.id === courseObj.id || c.title === courseObj.title);
  if (idx !== -1) {
    local[idx] = { ...local[idx], ...courseObj };
  } else {
    local.unshift(courseObj);
  }
  saveLocalCourses(local);

  try {
    const newCourse = await prisma.course.create({ data: courseObj });
    res.status(201).json(newCourse);
  } catch (error: any) {
    console.warn('[DB Fallback] Prisma POST failed, returning cached item:', error.message);
    res.status(201).json(courseObj);
  }
});

// PUT /api/courses/:id
router.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;

  // Persist to local cache immediately
  const local = getLocalCourses();
  const idx = local.findIndex((c: any) => c.id === id);
  if (idx !== -1) {
    local[idx] = { ...local[idx], ...updates };
    saveLocalCourses(local);
  }

  try {
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updates
    });
    res.json(updatedCourse);
  } catch (error: any) {
    console.warn('[DB Fallback] Prisma PUT failed, returning updated cached item:', error.message);
    const item = local.find(c => c.id === id) || { id, ...updates };
    res.json(item);
  }
});

// DELETE /api/courses/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  const local = getLocalCourses().filter((c: any) => c.id !== id);
  saveLocalCourses(local);

  try {
    await prisma.course.delete({ where: { id } });
  } catch (error: any) {}

  res.json({ success: true, deletedId: id });
});

export default router;
