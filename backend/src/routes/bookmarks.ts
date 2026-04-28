import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createBookmarkSchema = z.object({
  projectId: z.string(),
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { projectId } = createBookmarkSchema.parse(req.body);
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    if (existingBookmark) {
      return res.status(400).json({ error: 'Project already bookmarked' });
    }

    const bookmark = await prisma.bookmark.create({
      data: { userId, projectId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            githubLink: true,
            category: true,
            visibility: true,
            authorId: true,
            authorName: true,
          },
        },
      },
    });

    res.status(201).json(bookmark);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as bookmarkRoutes };