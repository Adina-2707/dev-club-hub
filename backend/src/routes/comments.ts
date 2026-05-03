import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createCommentSchema = z.object({
  text: z.string().min(1),
  targetId: z.string(),
  targetType: z.enum(['project', 'blog']),
});

// Get comments for a target
router.get('/', async (req, res) => {
  try {
    const targetId = typeof req.query.targetId === 'string' ? req.query.targetId : '';
    const targetType = typeof req.query.targetType === 'string' ? req.query.targetType : '';

    if (!targetId || !targetType) {
      return res.status(400).json({ error: 'targetId and targetType are required' });
    }

    const comments = await prisma.comment.findMany({
      where: {
        targetId,
        targetType: targetType as 'project' | 'blog',
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create comment
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { text, targetId, targetType } = createCommentSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { name: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        authorId: req.user!.id,
        authorName: user.name,
        targetId,
        targetType,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Create notification for the target author
    if (targetType === 'project') {
      const project = await prisma.project.findUnique({
        where: { id: targetId },
        select: { authorId: true, title: true },
      });
      if (project && project.authorId !== req.user!.id) {
        await prisma.notification.create({
          data: {
            userId: project.authorId,
            type: 'comment',
            message: `New comment on your project "${project.title}"`,
            relatedId: targetId,
          },
        });
      }
    } else if (targetType === 'blog') {
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: targetId },
        select: { authorId: true, title: true },
      });
      if (blogPost && blogPost.authorId !== req.user!.id) {
        await prisma.notification.create({
          data: {
            userId: blogPost.authorId,
            type: 'comment',
            message: `New comment on your blog post "${blogPost.title}"`,
            relatedId: targetId,
          },
        });
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.comment.delete({ where: { id } });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all comments for admin
router.get('/admin', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as commentRoutes };