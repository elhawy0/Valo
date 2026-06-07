import { getRedisClient } from '../config/redis';
import { createLogger } from '../utils/logger';

const logger = createLogger('cacheService');

export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const redis = getRedisClient();
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
};

export const setCachedData = async <T>(key: string, data: T, ttl = 3600): Promise<void> => {
  try {
    const redis = getRedisClient();
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    logger.error('Cache set error:', error);
  }
};

export const clearCache = async (pattern: string): Promise<void> => {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.error('Cache clear error:', error);
  }
};
