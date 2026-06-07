import Queue from 'bull';
import { getRedisClient } from './redis';
import { createLogger } from '../utils/logger';
import { processVideoJob } from '../services/videoProcessingService';

const logger = createLogger('queue');

let videoQueue: Queue.Queue;

export const initializeQueue = async (): Promise<void> => {
  try {
    const redis = getRedisClient();

    videoQueue = new Queue('video-generation', {
      createClient: () => redis,
    });

    // Process jobs
    videoQueue.process(5, processVideoJob);

    // Job events
    videoQueue.on('completed', (job) => {
      logger.info(`Job ${job.id} completed`);
    });

    videoQueue.on('failed', (job, err) => {
      logger.error(`Job ${job.id} failed:`, err);
    });

    videoQueue.on('progress', (job, progress) => {
      logger.info(`Job ${job.id} progress: ${progress}%`);
    });

    logger.info('Queue initialized');
  } catch (error) {
    logger.error('Failed to initialize queue:', error);
    throw error;
  }
};

export const getVideoQueue = (): Queue.Queue => {
  if (!videoQueue) {
    throw new Error('Video queue not initialized');
  }
  return videoQueue;
};
