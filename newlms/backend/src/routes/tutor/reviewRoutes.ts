import { Router, Request, Response } from 'express';
import prisma from '../../db';

const router = Router();

// GET /api/reviews
router.get('/', async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve reviews', message: error.message });
  }
});

// PUT /api/reviews/:id/reply
router.put('/:id/reply', async (req: Request, res: Response) => {
  try {
    const { replyText } = req.body;
    const updatedReview = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        reply: replyText || ''
      }
    });
    res.json(updatedReview);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reply to review', message: error.message });
  }
});

export default router;
