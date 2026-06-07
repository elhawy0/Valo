import { getPrismaClient } from '../config/database';
import { createLogger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const logger = createLogger('authService');
const prisma = getPrismaClient();

export const registerUser = async (email: string, name: string, password: string) => {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const apiKey = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        apiKey,
        tier: 'free',
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    return { user, token, apiKey };
  } catch (error) {
    logger.error('Registration failed:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password !== hashedPassword) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    return { user, token };
  } catch (error) {
    logger.error('Login failed:', error);
    throw error;
  }
};
