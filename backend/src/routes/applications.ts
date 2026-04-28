import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createApplicationSchema = z.object({
  internshipId: z.string(),
  message: z.string().optional(),
});

const updateApplicationSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']),
});

// Create application
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { internshipId, message } = createApplicationSchema.parse(req.body);
    const studentId = req.user!.id;

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
    });

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Check if already applied
    const existingApplication = await prisma.internshipApplication.findUnique({
      where: { studentId_internshipId: { studentId, internshipId } },
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'Already applied for this internship' });
    }

    const application = await prisma.internshipApplication.create({
      data: {
        studentId,
        internshipId,
        message,
      },
      include: {
        student: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        internship: {
          select: { id: true, title: true },
        },
      },
    });

    res.status(201).json(application);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's applications
router.get('/my', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const studentId = req.user!.id;

    const applications = await prisma.internshipApplication.findMany({
      where: { studentId },
      include: {
        student: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        internship: {
          select: {
            id: true,
            title: true,
            description: true,
            author: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update application status
router.patch('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const applicationId = String(req.params.id);
    const { status } = updateApplicationSchema.parse(req.body);

    const application = await prisma.internshipApplication.findUnique({
      where: { id: applicationId },
      include: {
        internship: {
          select: { authorId: true },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Only internship author can update application status
    if (application.internship.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedApplication = await prisma.internshipApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        student: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        internship: {
          select: { id: true, title: true },
        },
      },
    });

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: application.studentId,
        type: 'application_status',
        message: `Your internship application status has been updated to ${status}`,
        relatedId: applicationId,
      },
    });

    res.json(updatedApplication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as applicationRoutes };
