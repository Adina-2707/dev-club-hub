import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createScheduleSchema = z.object({
  title: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, startTime, endTime } = createScheduleSchema.parse(req.body);

    if (req.user!.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can create schedule slots' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (end <= start) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const schedule = await prisma.mentorSchedule.create({
      data: {
        mentorId: req.user!.id,
        title,
        startTime: start,
        endTime: end,
      },
    });

    res.status(201).json(schedule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create mentor schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const mentorId = String(req.params.id);

    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
      select: { id: true, role: true },
    });

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    const schedule = await prisma.mentorSchedule.findMany({
      where: { mentorId },
      orderBy: { startTime: 'asc' },
    });

    res.json(schedule);
  } catch (error) {
    console.error('Get mentor schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as mentorScheduleRoutes };