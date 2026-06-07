import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { AppError } from './errorHandler';

const RATE_LIMIT = 100; // requests per minute

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId || req.ip;
    const key = `rate-limit:${userId}`;
    const redis = getRedisClient();

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, 60);
    }

    if (current > RATE_LIMIT) {
      throw new AppError(429, 'Rate limit exceeded');
    }

    res.set('X-RateLimit-Remaining', String(RATE_LIMIT - current));
    next();
  } catch (error) {
    next(error);
  }
};
