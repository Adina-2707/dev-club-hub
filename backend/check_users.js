import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    await prisma.$connect();
    console.log('Connected to database successfully');

    // Check users in User table
    const users = await prisma.user.findMany();
    console.log('Users in database:', users.length);
    console.log('User emails:', users.map(u => u.email));

    // Check if specific user exists
    const user = await prisma.user.findUnique({
      where: { email: 'adinatest43@gmail.com' }
    });
    console.log('User adinatest43@gmail.com exists:', !!user);

  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();