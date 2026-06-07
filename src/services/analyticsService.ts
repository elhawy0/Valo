import { getPrismaClient } from '../config/database';
import { createLogger } from '../utils/logger';
import { AnalyticsData } from '../types';

const logger = createLogger('analyticsService');
const prisma = getPrismaClient();

export const trackVideoGeneration = async (userId: string, videoId: string) => {
  try {
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) return;

    await prisma.analytics.create({
      data: {
        userId,
        videoId,
        type: video.type,
        status: video.status,
        processingTime: video.processingTime || 0,
        resolution: video.resolution,
      },
    });
  } catch (error) {
    logger.error('Analytics tracking failed:', error);
  }
};

export const getUserAnalytics = async (userId: string, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await prisma.analytics.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalVideos = analytics.length;
    const successfulVideos = analytics.filter(a => a.status === 'completed').length;
    const totalProcessingTime = analytics.reduce((acc, a) => acc + (a.processingTime || 0), 0);
    const avgProcessingTime = totalVideos > 0 ? totalProcessingTime / totalVideos : 0;

    return {
      period: `Last ${days} days`,
      totalVideos,
      successRate: totalVideos > 0 ? (successfulVideos / totalVideos * 100).toFixed(2) : 0,
      averageProcessingTime: avgProcessingTime.toFixed(2),
      videosByType: getVideosByType(analytics),
      videosByResolution: getVideosByResolution(analytics),
    };
  } catch (error) {
    logger.error('Failed to get analytics:', error);
    throw error;
  }
};

const getVideosByType = (analytics: any[]) => {
  const types: Record<string, number> = {};
  analytics.forEach(a => {
    types[a.type] = (types[a.type] || 0) + 1;
  });
  return types;
};

const getVideosByResolution = (analytics: any[]) => {
  const resolutions: Record<string, number> = {};
  analytics.forEach(a => {
    resolutions[a.resolution] = (resolutions[a.resolution] || 0) + 1;
  });
  return resolutions;
};
