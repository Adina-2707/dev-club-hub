import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { logAdminAction } from '../utils/adminLog';

const router = express.Router();
const prisma = new PrismaClient();

const updateBlockStatusSchema = z.object({
  status: z.enum(['block', 'unblock']),
  reason: z.string().optional(),
});

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        avatar: true,
        nickname: true,
        createdAt: true,
        projects: {
          select: {
            id: true,
            title: true,
            description: true,
            githubLink: true,
            category: true,
            visibility: true,
            authorId: true,
            authorName: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        applications: {
          select: {
            id: true,
            message: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            internship: {
              select: {
                id: true,
                title: true,
                description: true,
                authorId: true,
                authorName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get projects for a specific user
router.get('/:id/projects', async (req, res) => {
  try {
    const id = String(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const projects = await prisma.project.findMany({
      where: { authorId: id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        members: {
          select: {
            id: true,
            userId: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nickname: true,
        avatar: true,
        blocked: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({ where: { id } });

    logAdminAction(req.user!.id, 'DELETE_USER', id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Block/Unblock user (admin only)
router.patch('/:id/block', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { status, reason } = updateBlockStatusSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData: { blocked: boolean; banReason: string | null } = {
      blocked: status === 'block',
      banReason: status === 'block' ? (reason || null) : null,
    };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        blocked: true,
        banReason: true,
      },
    });

    const actionType = status === 'block' ? 'BLOCK_USER' : 'UNBLOCK_USER';
    logAdminAction(req.user!.id, actionType, id);
    
    const message = status === 'block' ? 'User blocked successfully' : 'User unblocked successfully';
    res.json({ message, user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as userRoutes };