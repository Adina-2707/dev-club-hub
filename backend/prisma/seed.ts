import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create demo users
  const hashedPassword = await bcrypt.hash('123456', 10);

  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'student@test.com',
      password: hashedPassword,
      role: 'student',
      nickname: 'StudentDev',
    },
  });

  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@test.com' },
    update: {},
    create: {
      name: 'Demo Mentor',
      email: 'mentor@test.com',
      password: hashedPassword,
      role: 'mentor',
      nickname: 'MentorGuide',
    },
  });

  const alumni = await prisma.user.upsert({
    where: { email: 'alumni@test.com' },
    update: {},
    create: {
      name: 'Demo Alumni',
      email: 'alumni@test.com',
      password: hashedPassword,
      role: 'alumni',
      nickname: 'AlumniPro',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Demo Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      nickname: 'AdminMaster',
    },
  });

  // Create sample projects
  const project1 = await prisma.project.upsert({
    where: { id: 'p1' },
    update: {},
    create: {
      id: 'p1',
      title: 'TaskFlow App',
      description: 'A modern task management application with drag-and-drop support.',
      githubLink: 'https://github.com/demo/taskflow',
      authorId: student.id,
      authorName: student.name,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'p2' },
    update: {},
    create: {
      id: 'p2',
      title: 'DevChat',
      description: 'Real-time chat application for developer teams.',
      githubLink: 'https://github.com/demo/devchat',
      authorId: student.id,
      authorName: student.name,
    },
  });

  // Create likes and bookmarks
  await prisma.like.upsert({
    where: { userId_projectId: { userId: alumni.id, projectId: project1.id } },
    update: {},
    create: {
      userId: alumni.id,
      projectId: project1.id,
    },
  });

  await prisma.like.upsert({
    where: { userId_projectId: { userId: mentor.id, projectId: project2.id } },
    update: {},
    create: {
      userId: mentor.id,
      projectId: project2.id,
    },
  });

  await prisma.like.upsert({
    where: { userId_projectId: { userId: alumni.id, projectId: project2.id } },
    update: {},
    create: {
      userId: alumni.id,
      projectId: project2.id,
    },
  });

  await prisma.bookmark.upsert({
    where: { userId_projectId: { userId: alumni.id, projectId: project2.id } },
    update: {},
    create: {
      userId: alumni.id,
      projectId: project2.id,
    },
  });

  // Create sample blog post
  const blogPost = await prisma.blogPost.upsert({
    where: { id: 'b1' },
    update: {},
    create: {
      id: 'b1',
      title: 'Getting Started with React',
      content: 'React is a powerful library for building user interfaces. In this post, we\'ll explore the fundamentals of React including components, state, and props. Whether you\'re just starting out or looking to refresh your knowledge, this guide will help you understand the core concepts that make React so popular among developers.',
      authorId: mentor.id,
      authorName: mentor.name,
    },
  });

  // Create sample internship
  const internship = await prisma.internship.upsert({
    where: { id: 'i1' },
    update: {},
    create: {
      id: 'i1',
      title: 'Frontend Developer Intern',
      description: 'Join our team to work on cutting-edge React applications. You\'ll learn best practices in modern web development.',
      authorId: mentor.id,
      authorName: mentor.name,
    },
  });

  // Create sample comment
  await prisma.comment.upsert({
    where: { id: 'c1' },
    update: {},
    create: {
      id: 'c1',
      text: 'Отличный проект! Очень впечатляет.',
      authorId: alumni.id,
      authorName: alumni.name,
      targetId: project1.id,
      targetType: 'project',
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });