import { Router, Request, Response } from 'express';
import prisma from '../../db';

const router = Router();

// GET /api/announcements
router.get('/', async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(announcements);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve announcements', message: error.message });
  }
});

// POST /api/announcements
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, content, target, courseId, courseTitle, files } = req.body;
    const newAnn = await prisma.announcement.create({
      data: {
        title: title || '',
        content: content || '',
        target: target || 'All Students',
        courseId: courseId || null,
        courseTitle: courseTitle || '',
        date: new Date().toISOString().split('T')[0],
        files: files || []
      }
    });

    // Automatically log an activity
    await prisma.activity.create({
      data: {
        type: 'announcement',
        text: `You created a new announcement: "${newAnn.title}"`,
        time: 'Just now',
        courseId: newAnn.courseId
      }
    });

    res.status(201).json(newAnn);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create announcement', message: error.message });
  }
});

export default router;
