import Queue from 'bull';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { ReplicateService } from './replicate';
import { logger } from '../utils/logger';
import { VideoJobData } from '../types';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
let videoQueue: Queue.Queue<VideoJobData>;

export async function initializeQueue() {
  videoQueue = new Queue<VideoJobData>('video-generation', { redis });

  videoQueue.process(5, async (job) => {
    const { jobId, userId, type, textPrompt, imageUrl, imageUrls, style } = job.data;
    try {
      await prisma.videoJob.update({ where: { id: jobId }, data: { status: 'PROCESSING' } });
      job.progress(20);

      let predictionId: string;
      if (type === 'TEXT_TO_VIDEO') {
        predictionId = await ReplicateService.generateTextToVideo(textPrompt!, style);
      } else if (type === 'IMAGE_TO_VIDEO') {
        predictionId = await ReplicateService.generateImageToVideo(imageUrl!, textPrompt, style);
      } else {
        predictionId = await ReplicateService.generateMultipleImagesToVideo(imageUrls!, textPrompt, style);
      }

      await prisma.videoJob.update({ where: { id: jobId }, data: { replicateTaskId: predictionId } });
      job.progress(30);

      let attempts = 0;
      while (attempts < 600) {
        const prediction = await ReplicateService.getPrediction(predictionId);
        if (prediction.status === 'succeeded') {
          const videoUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
          await prisma.videoJob.update({
            where: { id: jobId },
            data: { status: 'COMPLETED', videoUrl: videoUrl as string, completedAt: new Date(), progress: 100 },
          });
          return { success: true, videoUrl };
        } else if (prediction.status === 'failed') {
          throw new Error(prediction.error || 'Video generation failed');
        }
        const progress = 30 + Math.min(attempts / 600 * 70, 70);
        job.progress(Math.floor(progress));
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }
      throw new Error('Video generation timeout');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await prisma.videoJob.update({ where: { id: jobId }, data: { status: 'FAILED', errorMessage, progress: 0 } });
      throw error;
    }
  });

  videoQueue.on('completed', (job) => logger.info(`Job completed: ${job.id}`));
  videoQueue.on('failed', (job, err) => logger.error(`Job failed: ${job.id}`, err));
}

export async function addVideoJob(data: VideoJobData) {
  return videoQueue.add(data, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
}