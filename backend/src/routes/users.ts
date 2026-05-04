import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { logAdminAction } from '../utils/adminLog';

const router = express.Router();
const prisma = new PrismaClient();

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