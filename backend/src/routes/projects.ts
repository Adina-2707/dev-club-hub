import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  githubLink: z.string().url(),
  category: z.enum(['AI', 'Web', 'Mobile']).optional(),
  visibility: z.enum(['public', 'private']).optional(),
  teamId: z.string().optional(),
});

const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  githubLink: z.string().url().optional(),
  category: z.enum(['AI', 'Web', 'Mobile']).optional(),
  visibility: z.enum(['public', 'private']).optional(),
  teamId: z.string().optional(),
});

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
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
        likes: {
          select: { userId: true },
        },
        bookmarks: {
          select: { userId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedProjects = await Promise.all(
      projects.map(async (project) => {
        const commentsCount = await prisma.comment.count({
          where: { targetId: project.id, targetType: 'project' },
        });
        return {
          ...project,
          likes: project.likes.map((like) => like.userId),
          bookmarks: project.bookmarks.map((bookmark) => bookmark.userId),
          likesCount: project.likes.length,
          bookmarksCount: project.bookmarks.length,
          commentsCount,
        };
      })
    );

    res.json(formattedProjects);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const project = await prisma.project.findUnique({
      where: { id },
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
        likes: {
          select: { userId: true },
        },
        bookmarks: {
          select: { userId: true },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const comments = await prisma.comment.findMany({
      where: { targetId: id, targetType: 'project' },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedProject = {
      ...project,
      likes: project.likes.map((like) => like.userId),
      bookmarks: project.bookmarks.map((bookmark) => bookmark.userId),
      likesCount: project.likes.length,
      bookmarksCount: project.bookmarks.length,
      commentsCount: comments.length,
      comments,
    };

    res.json(formattedProject);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create project
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, githubLink, category, visibility, teamId } = createProjectSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { name: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        githubLink,
        category,
        visibility: visibility || 'public',
        authorId: req.user!.id,
        authorName: user.name,
        teamId,
      },
    });

    // Add author as project owner
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: req.user!.id,
        name: user.name,
        role: 'owner',
      },
    });

    res.status(201).json({
      ...project,
      likes: [],
      bookmarks: [],
      likesCount: 0,
      bookmarksCount: 0,
      commentsCount: 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const updates = updateProjectSchema.parse(req.body);

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updates,
      include: {
        likes: {
          select: { userId: true },
        },
        bookmarks: {
          select: { userId: true },
        },
      },
    });

    const commentsCount = await prisma.comment.count({
      where: { targetId: id, targetType: 'project' },
    });

    const formattedProject = {
      ...updatedProject,
      likes: updatedProject.likes.map((like) => like.userId),
      bookmarks: updatedProject.bookmarks.map((bookmark) => bookmark.userId),
      likesCount: updatedProject.likes.length,
      bookmarksCount: updatedProject.bookmarks.length,
      commentsCount,
    };

    res.json(formattedProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle like
router.post('/:id/like', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const existingLike = await prisma.like.findUnique({
      where: { userId_projectId: { userId, projectId: id } },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { userId_projectId: { userId, projectId: id } },
      });
    } else {
      await prisma.like.create({
        data: { userId, projectId: id },
      });

      // Create notification for project author
      if (project.authorId !== userId) {
        await prisma.notification.create({
          data: {
            userId: project.authorId,
            type: 'like',
            message: `Your project "${project.title}" was liked`,
            relatedId: id,
          },
        });
      }
    }

    // Get updated likes
    const likes = await prisma.like.findMany({
      where: { projectId: id },
      select: { userId: true },
    });

    res.json({ likes: likes.map(like => like.userId) });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle bookmark
router.post('/:id/bookmark', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: { userId_projectId: { userId, projectId: id } },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { userId_projectId: { userId, projectId: id } },
      });
    } else {
      await prisma.bookmark.create({
        data: { userId, projectId: id },
      });
    }

    // Get updated bookmarks
    const bookmarks = await prisma.bookmark.findMany({
      where: { projectId: id },
      select: { userId: true },
    });

    res.json({ bookmarks: bookmarks.map(bookmark => bookmark.userId) });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add project member
router.post('/:projectId/members', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const projectId = String(req.params.projectId);
    const { userId, role = 'contributor' } = z.object({
      userId: z.string(),
      role: z.enum(['owner', 'maintainer', 'contributor']).optional(),
    }).parse(req.body);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only project owner/maintainers can add members
    const requesterRole = await prisma.projectMember.findFirst({
      where: { projectId, userId: req.user!.id },
    });

    if (!requesterRole || (requesterRole.role !== 'owner' && requesterRole.role !== 'maintainer')) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this project' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        name: user.name,
        role,
      },
    });

    // Create notification for new member
    await prisma.notification.create({
      data: {
        userId,
        type: 'project_member',
        message: `You were added to the project "${project.title}" as ${role}`,
        relatedId: projectId,
      },
    });

    res.status(201).json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project member role
router.patch('/:projectId/members/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const projectId = String(req.params.projectId);
    const userId = String(req.params.userId);
    const { role } = z.object({
      role: z.enum(['owner', 'maintainer', 'contributor']),
    }).parse(req.body);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only project owner can change roles
    const requesterRole = await prisma.projectMember.findFirst({
      where: { projectId, userId: req.user!.id },
    });

    if (!requesterRole || requesterRole.role !== 'owner') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const updatedMember = await prisma.projectMember.update({
      where: { id: member.id },
      data: { role },
    });

    res.json(updatedMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove project member
router.delete('/:projectId/members/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const projectId = String(req.params.projectId);
    const userId = String(req.params.userId);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only owner can remove members or user can remove themselves
    const requesterRole = await prisma.projectMember.findFirst({
      where: { projectId, userId: req.user!.id },
    });

    if (!requesterRole || (requesterRole.role !== 'owner' && req.user!.id !== userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    await prisma.projectMember.delete({ where: { id: member.id } });

    res.json({ message: 'Member removed from project' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as projectRoutes };