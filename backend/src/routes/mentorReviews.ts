import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createMentorReviewSchema = z.object({
  mentorId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// Create review for a mentor
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { mentorId, rating, comment } = createMentorReviewSchema.parse(req.body);
    const userId = req.user!.id;

    if (req.user!.role !== 'student') {
      return res.status(403).json({ error: 'Only students can leave mentor reviews' });
    }

    if (mentorId === userId) {
      return res.status(400).json({ error: 'Cannot review yourself' });
    }

    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
      select: { id: true, role: true },
    });

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    const review = await prisma.mentorReview.create({
      data: {
        mentorId,
        userId,
        rating,
        comment,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    const aggregate = await prisma.mentorReview.aggregate({
      where: { mentorId },
      _avg: { rating: true },
    });

    const averageRating = aggregate._avg.rating ?? 0;

    await prisma.user.update({
      where: { id: mentorId },
      data: { rating: averageRating },
    });

    res.status(201).json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create mentor review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reviews for a mentor
router.get('/:mentorId', async (req, res) => {
  try {
    const mentorId = String(req.params.mentorId);

    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
      select: { id: true, role: true },
    });

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    const reviews = await prisma.mentorReview.findMany({
      where: { mentorId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (error) {
    console.error('Get mentor reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as mentorReviewRoutes };