import express, { Request, Response } from 'express';
import { PrismaClient, VideoType } from '@prisma/client';
import { addVideoJob } from '../services/queue';
import { logger } from '../utils/logger';
import { VideoGenerationRequest } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

const getUserId = (req: Request): string => req.headers['x-user-id'] as string || 'default-user';

router.post('/text-to-video', async (req: Request, res: Response) => {
  try {
    const { textPrompt, style } = req.body as VideoGenerationRequest;
    const userId = getUserId(req);
    if (!textPrompt) return res.status(400).json({ success: false, message: 'Text prompt required' });
    const videoJob = await prisma.videoJob.create({
      data: { userId, type: 'TEXT_TO_VIDEO' as VideoType, textPrompt, style, status: 'PENDING' },
    });
    await addVideoJob({ jobId: videoJob.id, userId, type: 'TEXT_TO_VIDEO', textPrompt, style });
    logger.info(`Text-to-video job: ${videoJob.id}`);
    res.status(202).json({ success: true, message: 'Video generation started', jobId: videoJob.id });
  } catch (error) {
    logger.error('Text-to-video error:', error);
    res.status(500).json({ success: false, message: 'Failed to create job' });
  }
});

router.post('/image-to-video', async (req: Request, res: Response) => {
  try {
    const { imageUrl, textPrompt, style } = req.body as VideoGenerationRequest;
    const userId = getUserId(req);
    if (!imageUrl) return res.status(400).json({ success: false, message: 'Image URL required' });
    const videoJob = await prisma.videoJob.create({
      data: { userId, type: 'IMAGE_TO_VIDEO' as VideoType, imageUrl, textPrompt, style, status: 'PENDING' },
    });
    await addVideoJob({ jobId: videoJob.id, userId, type: 'IMAGE_TO_VIDEO', imageUrl, textPrompt, style });
    logger.info(`Image-to-video job: ${videoJob.id}`);
    res.status(202).json({ success: true, message: 'Video generation started', jobId: videoJob.id });
  } catch (error) {
    logger.error('Image-to-video error:', error);
    res.status(500).json({ success: false, message: 'Failed to create job' });
  }
});

router.post('/multiple-images-to-video', async (req: Request, res: Response) => {
  try {
    const { imageUrls, textPrompt, style } = req.body as VideoGenerationRequest;
    const userId = getUserId(req);
    if (!imageUrls || imageUrls.length === 0) return res.status(400).json({ success: false, message: 'Image URLs required' });
    const videoJob = await prisma.videoJob.create({
      data: { userId, type: 'MULTIPLE_IMAGES_TO_VIDEO' as VideoType, imageUrls, textPrompt, style, status: 'PENDING' },
    });
    await addVideoJob({ jobId: videoJob.id, userId, type: 'MULTIPLE_IMAGES_TO_VIDEO', imageUrls, textPrompt, style });
    logger.info(`Multiple images job: ${videoJob.id}`);
    res.status(202).json({ success: true, message: 'Video generation started', jobId: videoJob.id });
  } catch (error) {
    logger.error('Multiple images error:', error);
    res.status(500).json({ success: false, message: 'Failed to create job' });
  }
});

router.get('/:jobId', async (req: Request, res: Response) => {
  try {
    const videoJob = await prisma.videoJob.findUnique({ where: { id: req.params.jobId } });
    if (!videoJob) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: videoJob });
  } catch (error) {
    logger.error('Get job error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { status, limit = 20, offset = 0 } = req.query;
    const where = { userId, ...(status && { status: status as string }) };
    const [videos, total] = await Promise.all([
      prisma.videoJob.findMany({
        where,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.videoJob.count({ where }),
    ]);
    res.json({ success: true, data: videos, pagination: { total, limit: parseInt(limit as string), offset: parseInt(offset as string) } });
  } catch (error) {
    logger.error('List error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch videos' });
  }
});

router.delete('/:jobId', async (req: Request, res: Response) => {
  try {
    const videoJob = await prisma.videoJob.findUnique({ where: { id: req.params.jobId } });
    if (!videoJob) return res.status(404).json({ success: false, message: 'Job not found' });
    await prisma.videoJob.update({ where: { id: req.params.jobId }, data: { status: 'CANCELLED' } });
    res.json({ success: true, message: 'Job cancelled' });
  } catch (error) {
    logger.error('Cancel error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel job' });
  }
});

export default router;