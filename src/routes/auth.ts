import express from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const user = await prisma.user.create({ data: { email, password, name } });
    logger.info(`User registered: ${email}`);
    res.status(201).json({ success: true, userId: user.id });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(400).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    logger.info(`User logged in: ${email}`);
    res.json({ success: true, userId: user.id });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(400).json({ success: false, message: 'Login failed' });
  }
});

export default router;