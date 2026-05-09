import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);

    const mentor = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        expertise: true,
        github: true,
        linkedin: true,
        rating: true,
      },
    });

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    const completedInternshipsCount = await prisma.internshipApplication.count({
      where: {
        internship: {
          authorId: id,
        },
        status: 'accepted',
      },
    });

    const mentorProfile = {
      ...mentor,
      links: {
        github: mentor.github || null,
        linkedin: mentor.linkedin || null,
      },
      completedInternshipsCount,
    };

    res.json(mentorProfile);
  } catch (error) {
    console.error('Get mentor profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as mentorRoutes };