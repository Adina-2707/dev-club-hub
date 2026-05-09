import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConnection() {
  try {
    await prisma.$connect();
    console.log('Connected to database successfully');

    // Check if users table exists
    const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'`;
    console.log('Users table exists:', result.length > 0);

    if (result.length > 0) {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email: 'adinatest43@gmail.com' }
      });
      console.log('User adinatest43@gmail.com exists:', !!user);
    }

  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();