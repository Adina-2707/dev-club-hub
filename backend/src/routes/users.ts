import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { logAdminAction } from '../utils/adminLog';

const router = express.Router();
const prisma = new PrismaClient();

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

// Block user (admin only)
router.patch('/:id/block', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);

    const user = await prisma.user.update({
      where: { id },
      data: { blocked: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        blocked: true,
      },
    });

    logAdminAction(req.user!.id, 'BLOCK_USER', id);
    res.json({ message: 'User blocked successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as userRoutes };