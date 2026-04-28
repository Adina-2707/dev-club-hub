import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createLikeSchema = z.object({
  projectId: z.string(),
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { projectId } = createLikeSchema.parse(req.body);
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const existingLike = await prisma.like.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Project already liked' });
    }

    const like = await prisma.like.create({
      data: { userId, projectId },
    });

    if (project.authorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: project.authorId,
          type: 'like',
          message: `Your project "${project.title}" was liked`,
          relatedId: projectId,
        },
      });
    }

    res.status(201).json(like);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as likeRoutes };