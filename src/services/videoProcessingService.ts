import { Job } from 'bull';
import axios from 'axios';
import { getPrismaClient } from '../config/database';
import { createLogger } from '../utils/logger';
import { JobData } from '../types';

const logger = createLogger('videoProcessing');
const prisma = getPrismaClient();

export const processVideoJob = async (job: Job<JobData>) => {
  const { videoId, userId, request, replicateModelId } = job.data;
  const startTime = Date.now();

  try {
    await updateVideoStatus(videoId, 'processing');
    job.progress(10);

    // Prepare input based on type
    const input = prepareInput(job.data, request);
    job.progress(20);

    // Call Replicate API
    const prediction = await callReplicateAPI(replicateModelId, input);
    job.progress(50);

    // Poll for completion
    const result = await pollPrediction(prediction.id);
    job.progress(80);

    // Update video with result
    const processingTime = Date.now() - startTime;
    await updateVideoWithResult(videoId, result, processingTime);
    job.progress(100);

    logger.info(`Video processed successfully: ${videoId}`);
    return { success: true, videoId };
  } catch (error) {
    logger.error(`Video processing failed for ${videoId}:`, error);
    await updateVideoStatus(videoId, 'failed', (error as Error).message);
    throw error;
  }
};

const prepareInput = (jobData: JobData, request: any) => {
  const { type } = jobData;

  if (type === 'text-to-video') {
    return {
      prompt: request.textPrompt,
      duration: request.duration || 8,
      style: request.style || 'cinematic',
    };
  } else if (type === 'image-to-video') {
    return {
      image: request.imageUrl,
      prompt: request.textPrompt,
      duration: request.duration || 8,
    };
  } else {
    return {
      images: request.imageUrls,
      duration: request.duration || 8,
    };
  }
};

const callReplicateAPI = async (modelId: string, input: any) => {
  try {
    const response = await axios.post('https://api.replicate.com/v1/predictions', {
      version: modelId,
      input,
    }, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    logger.error('Replicate API error:', error);
    throw error;
  }
};

const pollPrediction = async (predictionId: string, maxAttempts = 120) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          },
        }
      );

      const { status, output, error } = response.data;

      if (status === 'succeeded') {
        return output;
      } else if (status === 'failed') {
        throw new Error(`Prediction failed: ${error}`);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      logger.error('Poll error:', error);
      throw error;
    }
  }

  throw new Error('Prediction timeout');
};

const updateVideoStatus = async (videoId: string, status: string, error?: string) => {
  await prisma.video.update({
    where: { id: videoId },
    data: { status: status as any, error },
  });
};

const updateVideoWithResult = async (videoId: string, result: any, processingTime: number) => {
  const videoUrl = Array.isArray(result) ? result[0] : result;

  await prisma.video.update({
    where: { id: videoId },
    data: {
      status: 'completed',
      videoUrl,
      processingTime,
      completedAt: new Date(),
    },
  });
};
