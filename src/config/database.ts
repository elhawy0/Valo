import { PrismaClient } from '@prisma/client';
import { createLogger } from '../utils/logger';

const logger = createLogger('database');

let prisma: PrismaClient;

export const connectDatabase = async (): Promise<void> => {
  try {
    if (!prisma) {
      prisma = new PrismaClient({
        log: ['warn', 'error'],
      });
    }
    await prisma.$connect();
    logger.info('Database connection successful');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }
  return prisma;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
  }
};
