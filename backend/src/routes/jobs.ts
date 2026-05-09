import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createJobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  postType: z.enum(['job', 'internship', 'referral']).optional(),
});

router.get('/', async (req, res) => {
  try {
    const jobs = await prisma.jobPost.findMany({
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, postType } = createJobSchema.parse(req.body);

    if (req.user!.role !== 'alumni') {
      return res.status(403).json({ error: 'Only alumni can publish job posts' });
    }

    const job = await prisma.jobPost.create({
      data: {
        alumniId: req.user!.id,
        title,
        description,
        postType: postType || 'job',
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.status(201).json(job);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create job post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as jobsRoutes };