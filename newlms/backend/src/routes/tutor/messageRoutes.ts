import { Router, Request, Response } from 'express';
import { messageRepository } from '../../repositories/messageRepository';
import prisma from '../../db';

const router = Router();

// GET /api/messages
router.get('/', async (req: Request, res: Response) => {
  const messages = await messageRepository.getMessages();
  res.json(messages);
});

// POST /api/messages
router.post('/', async (req: Request, res: Response) => {
  const newMsg = await messageRepository.sendMessage(req.body);
  res.status(201).json(newMsg);
});

// PUT /api/messages/:id/reply (Optionally append to thread)
router.put('/:id/reply', async (req: Request, res: Response) => {
  try {
    const { text, sender } = req.body;
    const msg = await prisma.message.findUnique({
      where: { id: req.params.id }
    });
    if (!msg) {
      return res.status(404).json({ error: 'Message thread not found' });
    }

    const updatedThread = [
      ...msg.thread,
      { sender: sender || 'You', text: text || '', time: 'Just now' }
    ];

    const updated = await prisma.message.update({
      where: { id: req.params.id },
      data: {
        preview: text ? text.slice(0, 80) + '...' : msg.preview,
        thread: updatedThread,
        unread: false
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reply to message', message: error.message });
  }
});

export default router;
