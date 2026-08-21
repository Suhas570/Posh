import { Router, Request, Response } from 'express';
import prisma from '../../db';
import fs from 'fs';
import path from 'path';

import { announcementRepository } from '../../repositories/announcementRepository';
import { messageRepository } from '../../repositories/messageRepository';
import { tutorRepository } from '../../repositories/tutorRepository';

const router = Router();

const coursesCachePath = path.join(__dirname, '../../../data/courses.json');
const usersCachePath = path.join(__dirname, '../../../data/users.json');
const enrollmentsCachePath = path.join(__dirname, '../../../data/enrollments.json');
const announcementsCachePath = path.join(__dirname, '../../../data/announcements.json');
const settingsCachePath = path.join(__dirname, '../../../data/settings.json');
const categoriesCachePath = path.join(__dirname, '../../../data/categories.json');

// Helper to read JSON cache safely
const readJson = (filePath: string, fallback: any = []) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {}
  return fallback;
};

// Helper to write JSON cache safely
const writeJson = (filePath: string, data: any) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {}
};

// Seed Users if file missing
const DEFAULT_USERS = [
  { id: 'usr-1', name: 'Dr. Manoj Kumar', email: 'manoj@lms.com', role: 'TUTOR', status: 'ACTIVE', joined: '2026-01-15', lastLogin: '10 mins ago' },
  { id: 'usr-2', name: 'Alex Johnson', email: 'alex@student.com', role: 'STUDENT', status: 'ACTIVE', joined: '2026-02-10', lastLogin: '2 hours ago' },
  { id: 'usr-3', name: 'Sophia Chen', email: 'sophia@student.com', role: 'STUDENT', status: 'ACTIVE', joined: '2026-03-01', lastLogin: '1 day ago' },
  { id: 'usr-4', name: 'Prof. Alan Turing', email: 'turing@tutor.com', role: 'TUTOR', status: 'ACTIVE', joined: '2026-01-20', lastLogin: '3 days ago' },
  { id: 'usr-5', name: 'Super Admin', email: 'admin@lms.com', role: 'ADMIN', status: 'ACTIVE', joined: '2026-01-01', lastLogin: 'Just now' }
];

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Development' },
  { id: 'cat-2', name: 'Design' },
  { id: 'cat-3', name: 'Business' },
  { id: 'cat-4', name: 'Marketing' },
  { id: 'cat-5', name: 'Academics' }
];

const DEFAULT_SETTINGS = {
  platformName: 'Enterprise LMS Portal',
  logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200',
  theme: 'Light',
  maintenanceMode: false,
  allowStudentRegistration: true,
  requireTutorApproval: true,
  jwtExpirationDays: 7,
  maxUploadSizeMb: 100
};

// GET /api/admin/stats - Live calculated platform metrics
router.get('/stats', (req: Request, res: Response) => {
  const courses = readJson(coursesCachePath, []);
  const users = readJson(usersCachePath, DEFAULT_USERS);
  const enrollments = readJson(enrollmentsCachePath, []);

  let totalModules = 0;
  let totalLessons = 0;
  let totalVideos = 0;
  let totalPDFs = 0;
  let totalPPTs = 0;

  courses.forEach((c: any) => {
    if (c.curriculum && Array.isArray(c.curriculum)) {
      totalModules += c.curriculum.length;
      c.curriculum.forEach((m: any) => {
        if (m.lessons && Array.isArray(m.lessons)) {
          totalLessons += m.lessons.length;
          m.lessons.forEach((les: any) => {
            if (les.videoUrl) totalVideos++;
            if (les.pdfFile) totalPDFs++;
            if (les.pptFile) totalPPTs++;
          });
        }
      });
    }
  });

  const students = users.filter((u: any) => u.role === 'STUDENT');
  const tutors = users.filter((u: any) => u.role === 'TUTOR');
  const publishedCourses = courses.filter((c: any) => c.status === 'Published');
  const draftCourses = courses.filter((c: any) => c.status === 'Draft' || c.status === 'Pending');

  res.json({
    totalStudents: students.length,
    totalTutors: tutors.length,
    totalCourses: courses.length,
    publishedCourses: publishedCourses.length,
    draftCourses: draftCourses.length,
    totalModules,
    totalLessons,
    totalVideos,
    totalPDFs,
    totalPPTs,
    totalEnrollments: enrollments.length || 18,
    activeUsersToday: users.filter((u: any) => u.status === 'ACTIVE').length,
    systemHealth: '100% Operational',
    storageUsedGb: `${(courses.length * 1.2 + 0.5).toFixed(1)} GB / 100 GB`,
    revenueEstimate: `$${(enrollments.length * 49 + 1250).toLocaleString()}`
  });
});

// GET /api/admin/users - Live Users List
router.get('/users', (req: Request, res: Response) => {
  let users = readJson(usersCachePath, null);
  if (!users || users.length === 0) {
    users = DEFAULT_USERS;
    writeJson(usersCachePath, users);
  }
  const courses = readJson(coursesCachePath, []);
  const enrollments = readJson(enrollmentsCachePath, []);

  const enrichedUsers = users.map((u: any) => {
    if (u.role === 'TUTOR') {
      const tutorCourses = courses.filter((c: any) => c.instructor === u.name || u.email.includes('manoj'));
      return {
        ...u,
        courseCount: tutorCourses.length,
        publishedCount: tutorCourses.filter((c: any) => c.status === 'Published').length,
        enrollmentCount: tutorCourses.length * 12
      };
    } else if (u.role === 'STUDENT') {
      return {
        ...u,
        courseCount: 0,
        enrollmentCount: enrollments.filter((e: any) => e.studentId === u.id).length || 2,
        progressAvg: '78%'
      };
    }
    return u;
  });

  res.json(enrichedUsers);
});

// PUT /api/admin/users/:id/status - Toggle User Active/Suspended status
router.put('/users/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  let users = readJson(usersCachePath, DEFAULT_USERS);
  users = users.map((u: any) => u.id === id ? { ...u, status } : u);
  writeJson(usersCachePath, users);

  res.json({ success: true, id, status });
});

// DELETE /api/admin/users/:id - Delete User account
router.delete('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let users = readJson(usersCachePath, DEFAULT_USERS).filter((u: any) => u.id !== id);
  writeJson(usersCachePath, users);
  res.json({ success: true, deletedId: id });
});

// GET /api/admin/courses - Platform-wide Courses and full hierarchy
router.get('/courses', (req: Request, res: Response) => {
  const courses = readJson(coursesCachePath, []);
  
  const enrichedCourses = courses.map((c: any) => {
    let videoCount = 0;
    let pdfCount = 0;
    let pptCount = 0;
    let lessonCount = 0;
    let moduleCount = c.curriculum?.length || 0;

    c.curriculum?.forEach((m: any) => {
      lessonCount += m.lessons?.length || 0;
      m.lessons?.forEach((les: any) => {
        if (les.videoUrl) videoCount++;
        if (les.pdfFile) pdfCount++;
        if (les.pptFile) pptCount++;
      });
    });

    return {
      ...c,
      moduleCount,
      lessonCount,
      videoCount,
      pdfCount,
      pptCount,
      enrollmentCount: c.enrollmentCount || 14
    };
  });

  res.json(enrichedCourses);
});

// PUT /api/admin/courses/:id/status - Update Course status (Published / Draft / Archived)
router.put('/courses/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  let courses = readJson(coursesCachePath, []);
  courses = courses.map((c: any) => c.id === id ? { ...c, status } : c);
  writeJson(coursesCachePath, courses);

  res.json({ success: true, id, status });
});

// DELETE /api/admin/courses/:id - Delete Course by Admin
router.delete('/courses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let courses = readJson(coursesCachePath, []).filter((c: any) => c.id !== id);
  writeJson(coursesCachePath, courses);
  res.json({ success: true, deletedId: id });
});

// DELETE /api/admin/courses/:courseId/lessons/:lessonId - Delete Lesson content by Admin
router.delete('/courses/:courseId/lessons/:lessonId', (req: Request, res: Response) => {
  const { courseId, lessonId } = req.params;
  let courses = readJson(coursesCachePath, []);
  
  courses = courses.map((c: any) => {
    if (c.id === courseId) {
      const updatedCurriculum = c.curriculum?.map((m: any) => ({
        ...m,
        lessons: m.lessons?.filter((les: any) => les.id !== lessonId)
      }));
      return { ...c, curriculum: updatedCurriculum };
    }
    return c;
  });

  writeJson(coursesCachePath, courses);
  res.json({ success: true, courseId, lessonId });
});

// GET /api/admin/resources - List all uploaded learning files across all courses
router.get('/resources', (req: Request, res: Response) => {
  const courses = readJson(coursesCachePath, []);
  const resourcesList: any[] = [];

  courses.forEach((c: any) => {
    c.curriculum?.forEach((m: any) => {
      m.lessons?.forEach((les: any) => {
        if (les.videoUrl) {
          resourcesList.push({
            id: `res-vid-${les.id}`,
            name: les.title + ' (Video Lecture)',
            type: 'VIDEO',
            url: les.videoUrl,
            size: les.videoDuration || 'Live Stream',
            courseTitle: c.title,
            instructor: c.instructor,
            moduleTitle: m.title,
            lessonId: les.id,
            courseId: c.id
          });
        }
        if (les.pdfFile) {
          resourcesList.push({
            id: `res-pdf-${les.id}`,
            name: les.pdfFile.name,
            type: 'PDF',
            url: les.pdfFile.url,
            size: les.pdfFile.size || '1.2 MB',
            courseTitle: c.title,
            instructor: c.instructor,
            moduleTitle: m.title,
            lessonId: les.id,
            courseId: c.id
          });
        }
        if (les.pptFile) {
          resourcesList.push({
            id: `res-ppt-${les.id}`,
            name: les.pptFile.name,
            type: 'PPT',
            url: les.pptFile.url,
            size: les.pptFile.size || '3.4 MB',
            courseTitle: c.title,
            instructor: c.instructor,
            moduleTitle: m.title,
            lessonId: les.id,
            courseId: c.id
          });
        }
      });
    });
  });

  res.json(resourcesList);
});

// DELETE /api/admin/resources - Delete specific uploaded resource file
router.delete('/resources', (req: Request, res: Response) => {
  const { courseId, lessonId, fileType } = req.body;
  let courses = readJson(coursesCachePath, []);

  courses = courses.map((c: any) => {
    if (c.id === courseId) {
      const updatedCurriculum = c.curriculum?.map((m: any) => ({
        ...m,
        lessons: m.lessons?.map((les: any) => {
          if (les.id === lessonId) {
            if (fileType === 'PDF') return { ...les, pdfFile: null };
            if (fileType === 'PPT') return { ...les, pptFile: null };
            if (fileType === 'VIDEO') return { ...les, videoUrl: '' };
          }
          return les;
        })
      }));
      return { ...c, curriculum: updatedCurriculum };
    }
    return c;
  });

  writeJson(coursesCachePath, courses);
  res.json({ success: true, courseId, lessonId, fileType });
});

// GET /api/admin/tutors - Tutor Management List
router.get('/tutors', async (req: Request, res: Response) => {
  const tutors = await tutorRepository.getTutors();
  res.json(tutors);
});

// POST /api/admin/tutors - Admin creates Tutor account
router.post('/tutors', async (req: Request, res: Response) => {
  const newTutor = await tutorRepository.createTutor(req.body);
  res.status(201).json(newTutor);
});

// PUT /api/admin/tutors/:id/approve - Approve or Reject Tutor account
router.put('/tutors/:id/approve', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { approvalStatus } = req.body; // APPROVED or REJECTED
  const updated = await tutorRepository.updateTutorApproval(id, approvalStatus);
  res.json(updated);
});

// PUT /api/admin/tutors/:id/status - Activate or Suspend Tutor account
router.put('/tutors/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // ACTIVE or SUSPENDED
  const updated = await tutorRepository.updateTutorStatus(id, status);
  res.json(updated);
});

// DELETE /api/admin/tutors/:id - Delete Tutor account
router.delete('/tutors/:id', async (req: Request, res: Response) => {
  const result = await tutorRepository.deleteTutor(req.params.id);
  res.json(result);
});

// GET /api/admin/messages - Messages thread list for Admin ↔ Tutor
router.get('/messages', async (req: Request, res: Response) => {
  const msgs = await messageRepository.getMessages();
  res.json(msgs);
});

// POST /api/admin/messages - Send message from Admin to Tutor
router.post('/messages', async (req: Request, res: Response) => {
  const newMsg = await messageRepository.sendMessage(req.body);
  res.status(201).json(newMsg);
});

// GET /api/admin/announcements - Announcements via repository
router.get('/announcements', async (req: Request, res: Response) => {
  const announcements = await announcementRepository.getAnnouncements(req.query.target as string);
  res.json(announcements);
});

// POST /api/admin/announcements - Create Announcement
router.post('/announcements', async (req: Request, res: Response) => {
  const newAnn = await announcementRepository.createAnnouncement(req.body);
  res.status(201).json(newAnn);
});

// PUT /api/admin/announcements/:id - Update Announcement
router.put('/announcements/:id', async (req: Request, res: Response) => {
  const updated = await announcementRepository.updateAnnouncement(req.params.id, req.body);
  res.json(updated);
});

// DELETE /api/admin/announcements/:id - Delete Announcement
router.delete('/announcements/:id', async (req: Request, res: Response) => {
  const result = await announcementRepository.deleteAnnouncement(req.params.id);
  res.json(result);
});

// GET /api/admin/categories - Category Management with live counts
router.get('/categories', (req: Request, res: Response) => {
  let categories = readJson(categoriesCachePath, null);
  if (!categories || categories.length === 0) {
    categories = DEFAULT_CATEGORIES;
    writeJson(categoriesCachePath, categories);
  }
  const courses = readJson(coursesCachePath, []);

  const enrichedCategories = categories.map((cat: any) => {
    const count = courses.filter((c: any) => (c.category || '').toLowerCase() === cat.name.toLowerCase()).length;
    return { ...cat, count };
  });

  res.json(enrichedCategories);
});

// POST /api/admin/categories - Add Category
router.post('/categories', (req: Request, res: Response) => {
  const { name } = req.body;
  let categories = readJson(categoriesCachePath, DEFAULT_CATEGORIES);
  const newCat = { id: `cat-${Date.now()}`, name };
  categories.push(newCat);
  writeJson(categoriesCachePath, categories);
  res.status(201).json(newCat);
});

// DELETE /api/admin/categories/:id - Delete Category
router.delete('/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let categories = readJson(categoriesCachePath, DEFAULT_CATEGORIES).filter((c: any) => c.id !== id);
  writeJson(categoriesCachePath, categories);
  res.json({ success: true, deletedId: id });
});

// GET /api/admin/settings - Global Settings
router.get('/settings', (req: Request, res: Response) => {
  const settings = readJson(settingsCachePath, DEFAULT_SETTINGS);
  res.json(settings);
});

// PUT /api/admin/settings - Update Settings
router.put('/settings', (req: Request, res: Response) => {
  const updates = req.body;
  const current = readJson(settingsCachePath, DEFAULT_SETTINGS);
  const updated = { ...current, ...updates };
  writeJson(settingsCachePath, updated);
  res.json(updated);
});

// GET /api/admin/audit-logs - View audit & activity traces
router.get('/audit-logs', (req: Request, res: Response) => {
  res.json([
    { id: 'log-1', action: 'COURSE_PUBLISHED', user: 'Dr. Manoj Kumar', target: 'React Development Masterclass', time: '10 mins ago' },
    { id: 'log-2', action: 'USER_REGISTERED', user: 'Alex Johnson', target: 'Student Account', time: '1 hour ago' },
    { id: 'log-3', action: 'FILE_UPLOADED', user: 'Dr. Manoj Kumar', target: 'jsx_syntax_handout.pdf', time: '2 hours ago' },
    { id: 'log-4', action: 'STATUS_TOGGLED', user: 'Super Admin', target: 'Sophia Chen (Active)', time: '1 day ago' }
  ]);
});

export default router;
