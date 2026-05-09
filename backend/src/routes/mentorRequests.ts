import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createMentorRequestSchema = z.object({
  mentorId: z.string().min(1),
  message: z.string().optional(),
});

const updateMentorRequestSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
});

// Create a mentor request
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { mentorId, message } = createMentorRequestSchema.parse(req.body);
    const studentId = req.user!.id;

    if (req.user!.role !== 'student') {
      return res.status(403).json({ error: 'Only students can send mentor requests' });
    }

    if (mentorId === studentId) {
      return res.status(400).json({ error: 'Cannot send request to yourself' });
    }

    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
      select: { id: true, role: true, name: true },
    });

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    const mentorRequest = await prisma.mentorRequest.create({
      data: {
        studentId,
        mentorId,
        message,
      },
      include: {
        student: {
          select: { id: true, name: true, avatar: true },
        },
        mentor: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.status(201).json(mentorRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create mentor request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get mentor requests for current user
router.get('/my', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const mentorRequests = await prisma.mentorRequest.findMany({
      where: {
        OR: [
          { studentId: userId },
          { mentorId: userId },
        ],
      },
      include: {
        student: {
          select: { id: true, name: true, avatar: true },
        },
        mentor: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(mentorRequests);
  } catch (error) {
    console.error('Get mentor requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update mentor request status
router.patch('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { status } = updateMentorRequestSchema.parse(req.body);

    const mentorRequest = await prisma.mentorRequest.findUnique({
      where: { id },
    });

    if (!mentorRequest) {
      return res.status(404).json({ error: 'Mentor request not found' });
    }

    if (mentorRequest.mentorId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the mentor can update this request' });
    }

    const updatedRequest = await prisma.mentorRequest.update({
      where: { id },
      data: { status },
      include: {
        student: {
          select: { id: true, name: true, avatar: true },
        },
        mentor: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.json(updatedRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update mentor request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as mentorRequestRoutes };