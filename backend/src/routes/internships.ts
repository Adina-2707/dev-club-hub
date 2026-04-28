import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createInternshipSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const updateInternshipSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

// Get all internships
router.get('/', async (req, res) => {
  try {
    const internships = await prisma.internship.findMany({
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedInternships = await Promise.all(
      internships.map(async (internship) => {
        const applicationsCount = await prisma.internshipApplication.count({
          where: { internshipId: internship.id },
        });
        return {
          ...internship,
          applicationsCount,
        };
      })
    );

    res.json(formattedInternships);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get internship by ID
router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const internship = await prisma.internship.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        applications: {
          include: {
            student: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    const applicationsCount = await prisma.internshipApplication.count({
      where: { internshipId: id },
    });

    const formattedInternship = {
      ...internship,
      applicationsCount,
    };

    res.json(formattedInternship);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create internship
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description } = createInternshipSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { name: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const internship = await prisma.internship.create({
      data: {
        title,
        description,
        authorId: req.user!.id,
        authorName: user.name,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.status(201).json({
      ...internship,
      applicationsCount: 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update internship
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const updates = updateInternshipSchema.parse(req.body);

    const internship = await prisma.internship.findUnique({ where: { id } });
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    if (internship.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedInternship = await prisma.internship.update({
      where: { id },
      data: updates,
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    const applicationsCount = await prisma.internshipApplication.count({
      where: { internshipId: id },
    });

    const formattedInternship = {
      ...updatedInternship,
      applicationsCount,
    };

    res.json(formattedInternship);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete internship
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);

    const internship = await prisma.internship.findUnique({ where: { id } });
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    if (internship.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.internship.delete({ where: { id } });
    res.json({ message: 'Internship deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as internshipRoutes };