import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createBlogPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

const updateBlogPostSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
});

// Get all blog posts
router.get('/', async (req, res) => {
  try {
    const blogPosts = await prisma.blogPost.findMany({
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedPosts = await Promise.all(
      blogPosts.map(async (post) => {
        const commentsCount = await prisma.comment.count({
          where: { targetId: post.id, targetType: 'blog' },
        });
        return {
          ...post,
          commentsCount,
        };
      })
    );

    res.json(formattedPosts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get blog post by ID
router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const blogPost = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!blogPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const comments = await prisma.comment.findMany({
      where: { targetId: id, targetType: 'blog' },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const commentsCount = await prisma.comment.count({
      where: { targetId: id, targetType: 'blog' },
    });

    const formattedPost = {
      ...blogPost,
      commentsCount,
      comments,
    };

    res.json(formattedPost);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create blog post
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, content } = createBlogPostSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { name: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        content,
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
      ...blogPost,
      commentsCount: 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update blog post
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const updates = updateBlogPostSchema.parse(req.body);

    const blogPost = await prisma.blogPost.findUnique({ where: { id } });
    if (!blogPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    if (blogPost.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: updates,
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    const commentsCount = await prisma.comment.count({
      where: { targetId: id, targetType: 'blog' },
    });

    const formattedPost = {
      ...updatedPost,
      commentsCount,
    };

    res.json(formattedPost);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete blog post
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);

    const blogPost = await prisma.blogPost.findUnique({ where: { id } });
    if (!blogPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    if (blogPost.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.blogPost.delete({ where: { id } });
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as blogRoutes };