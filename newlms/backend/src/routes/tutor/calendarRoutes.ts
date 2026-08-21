import { Router, Request, Response } from 'express';
import prisma from '../../db';

const router = Router();

// GET /api/calendar
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await prisma.calendarEvent.findMany({
      orderBy: { date: 'asc' }
    });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve calendar events', message: error.message });
  }
});

// POST /api/calendar
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, date, type, time } = req.body;
    const newEvent = await prisma.calendarEvent.create({
      data: {
        title: title || '',
        date: date || '',
        type: type || 'Live Session',
        time: time || '10:00 AM'
      }
    });
    res.status(201).json(newEvent);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to schedule calendar event', message: error.message });
  }
});

export default router;
