import { getPrismaClient } from '../config/database';
import { getVideoQueue } from '../config/queue';
import { getRedisClient } from '../config/redis';
import { createLogger } from '../utils/logger';
import { VideoGenerationRequest, JobData } from '../types';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('videoService');
const prisma = getPrismaClient();

export const createVideoJob = async (
  userId: string,
  request: VideoGenerationRequest,
  type: 'text-to-video' | 'image-to-video' | 'multiple-images-to-video'
) => {
  try {
    const videoId = uuidv4();
    const queue = getVideoQueue();

    const video = await prisma.video.create({
      data: {
        id: videoId,
        userId,
        jobId: '', // Will be updated after job creation
        type,
        status: 'pending',
        prompt: request.textPrompt || '',
        resolution: request.resolution || '720p',
        fps: request.fps || 30,
        metadata: request,
      },
    });

    const jobData: JobData = {
      userId,
      videoId,
      type,
      request,
      replicateModelId: getReplicateModel(type),
    };

    const job = await queue.add(jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    });

    // Update video with jobId
    await prisma.video.update({
      where: { id: videoId },
      data: { jobId: job.id.toString() },
    });

    logger.info(`Video job created: ${videoId}`);
    return { ...video, jobId: job.id.toString() };
  } catch (error) {
    logger.error('Failed to create video job:', error);
    throw error;
  }
};

export const getVideoStatus = async (videoId: string, userId: string) => {
  try {
    const video = await prisma.video.findFirst({
      where: { id: videoId, userId },
    });

    if (!video) {
      throw new Error('Video not found');
    }

    return video;
  } catch (error) {
    logger.error('Failed to get video status:', error);
    throw error;
  }
};

export const getUserVideos = async (userId: string, limit = 20, offset = 0) => {
  try {
    const videos = await prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.video.count({ where: { userId } });

    return { videos, total, limit, offset };
  } catch (error) {
    logger.error('Failed to get user videos:', error);
    throw error;
  }
};

export const deleteVideo = async (videoId: string, userId: string) => {
  try {
    const video = await prisma.video.findFirst({
      where: { id: videoId, userId },
    });

    if (!video) {
      throw new Error('Video not found');
    }

    await prisma.video.delete({ where: { id: videoId } });
    logger.info(`Video deleted: ${videoId}`);
  } catch (error) {
    logger.error('Failed to delete video:', error);
    throw error;
  }
};

const getReplicateModel = (type: string): string => {
  const models: Record<string, string> = {
    'text-to-video': process.env.REPLICATE_TEXT_TO_VIDEO_MODEL || 'openai/text-to-video',
    'image-to-video': process.env.REPLICATE_IMAGE_TO_VIDEO_MODEL || 'runway/image-to-video',
    'multiple-images-to-video': process.env.REPLICATE_MULTIPLE_IMAGES_MODEL || 'cog/video-generator',
  };
  return models[type] || models['text-to-video'];
};
