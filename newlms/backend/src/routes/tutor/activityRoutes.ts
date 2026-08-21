import { Router, Request, Response } from 'express';
import prisma from '../../db';

const router = Router();

// GET /api/activities
router.get('/', async (req: Request, res: Response) => {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { id: 'desc' },
      take: 15
    });
    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve activities', message: error.message });
  }
});

// POST /api/activities
router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, text, courseId } = req.body;
    const newActivity = await prisma.activity.create({
      data: {
        type: type || 'info',
        text: text || '',
        time: 'Just now',
        courseId: courseId || null
      }
    });
    res.status(201).json(newActivity);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add activity', message: error.message });
  }
});

export default router;
