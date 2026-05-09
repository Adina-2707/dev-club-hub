import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createAlumniStorySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  storyType: z.enum(['success', 'career']).optional(),
});

// Get all alumni stories
router.get('/', async (req, res) => {
  try {
    const stories = await prisma.alumniStory.findMany({
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(stories);
  } catch (error) {
    console.error('Get alumni stories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create alumni story
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, content, storyType } = createAlumniStorySchema.parse(req.body);

    if (req.user!.role !== 'alumni') {
      return res.status(403).json({ error: 'Only alumni can publish stories' });
    }

    const story = await prisma.alumniStory.create({
      data: {
        alumniId: req.user!.id,
        title,
        content,
        storyType: storyType || 'success',
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.status(201).json(story);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create alumni story error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as alumniStoriesRoutes };