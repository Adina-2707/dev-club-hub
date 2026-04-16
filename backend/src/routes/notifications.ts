import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user notifications
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json(updatedNotification);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id },
      data: { read: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.notification.delete({ where: { id } });
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as notificationRoutes };