import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);

    const alumni = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        achievements: true,
        links: true,
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
      },
    });

    if (!alumni || alumni.role !== 'alumni') {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    res.json(alumni);
  } catch (error) {
    console.error('Get alumni profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as alumniRoutes };