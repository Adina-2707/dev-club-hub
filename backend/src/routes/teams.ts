import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createTeamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  goals: z.string().optional(),
  category: z.string().optional(),
  visibility: z.enum(['public', 'private']),
});

const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  goals: z.string().optional(),
  category: z.string().optional(),
  visibility: z.enum(['public', 'private']).optional(),
});

const joinTeamSchema = z.object({
  userId: z.string(),
  name: z.string(),
});

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedTeams = teams.map(team => ({
      ...team,
      members: team.members.map(member => ({
        id: member.userId,
        name: member.name,
        role: member.role,
      })),
      projectsCount: team._count.projects,
    }));

    res.json(formattedTeams);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get team by ID
router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: {
          select: { projects: true },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const formattedTeam = {
      ...team,
      members: team.members.map((member) => ({
        id: member.userId,
        name: member.name,
        role: member.role,
      })),
      projectsCount: team._count.projects,
    };

    res.json(formattedTeam);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create team
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, description, goals, category, visibility } = createTeamSchema.parse(req.body);

    const team = await prisma.team.create({
      data: {
        name,
        description,
        goals,
        category,
        visibility,
        ownerId: req.user!.id,
      },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Add owner as leader
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { name: true },
    });

    if (user) {
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: req.user!.id,
          name: user.name,
          role: 'leader',
        },
      });
    }

    res.status(201).json({
      ...team,
      members: [{ id: req.user!.id, name: user!.name, role: 'leader' }],
      projectsCount: 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update team
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const updates = updateTeamSchema.parse(req.body);

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: updates,
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: {
          select: { projects: true },
        },
      },
    });

    const formattedTeam = {
      ...updatedTeam,
      members: updatedTeam.members.map((member) => ({
        id: member.userId,
        name: member.name,
        role: member.role,
      })),
      projectsCount: updatedTeam._count.projects,
    };

    res.json(formattedTeam);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete team
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.team.delete({ where: { id } });
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join team
router.post('/:id/join', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { userId, name } = joinTeamSchema.parse(req.body);

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: id, userId } },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Already a member of this team' });
    }

    await prisma.teamMember.create({
      data: {
        teamId: id,
        userId,
        name,
        role: 'member',
      },
    });

    res.json({ message: 'Joined team successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave team
router.post('/:id/leave', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.ownerId === userId) {
      return res.status(400).json({ error: 'Team owner cannot leave the team' });
    }

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId: id, userId } },
    });

    res.json({ message: 'Left team successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update member role
router.put('/:id/members/:memberId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const memberId = String(req.params.memberId);
    const { role } = z.object({ role: z.enum(['leader', 'member']) }).parse(req.body);

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.teamMember.update({
      where: { teamId_userId: { teamId: id, userId: memberId } },
      data: { role },
    });

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as teamRoutes };