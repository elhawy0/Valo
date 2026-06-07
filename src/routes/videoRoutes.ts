import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  createVideoJob,
  getVideoStatus,
  getUserVideos,
  deleteVideo,
} from '../services/videoService';
import { trackVideoGeneration } from '../services/analyticsService';

const router = Router();

// Apply authentication to all video routes
router.use(authenticate);

// Text to Video
router.post('/text-to-video', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { textPrompt, style, duration, fps, resolution } = req.body;

    if (!textPrompt) {
      throw new AppError(400, 'textPrompt is required');
    }

    const video = await createVideoJob(req.userId!, {
      textPrompt,
      style,
      duration,
      fps,
      resolution,
    }, 'text-to-video');

    await trackVideoGeneration(req.userId!, video.id);

    res.status(201).json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
});

// Image to Video
router.post('/image-to-video', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageUrl, textPrompt, duration, fps, resolution } = req.body;

    if (!imageUrl) {
      throw new AppError(400, 'imageUrl is required');
    }

    const video = await createVideoJob(req.userId!, {
      imageUrl,
      textPrompt,
      duration,
      fps,
      resolution,
    }, 'image-to-video');

    await trackVideoGeneration(req.userId!, video.id);

    res.status(201).json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
});

// Multiple Images to Video
router.post('/multiple-images-to-video', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageUrls, duration, fps, resolution } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length < 2) {
      throw new AppError(400, 'At least 2 imageUrls are required');
    }

    const video = await createVideoJob(req.userId!, {
      imageUrls,
      duration,
      fps,
      resolution,
    }, 'multiple-images-to-video');

    await trackVideoGeneration(req.userId!, video.id);

    res.status(201).json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
});

// Get Video Status
router.get('/:videoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId } = req.params;
    const video = await getVideoStatus(videoId, req.userId!);

    res.json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
});

// List User Videos
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await getUserVideos(req.userId!, limit, offset);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Delete Video
router.delete('/:videoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId } = req.params;
    await deleteVideo(videoId, req.userId!);

    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
