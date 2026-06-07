import axios from 'axios';
import { REPLICATE_API_URL, REPLICATE_API_TOKEN, REPLICATE_MODELS } from '../config/replicate';
import { logger } from '../utils/logger';

const client = axios.create({
  baseURL: REPLICATE_API_URL,
  headers: {
    'Authorization': `Token ${REPLICATE_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export class ReplicateService {
  static async generateTextToVideo(textPrompt: string, style?: string): Promise<string> {
    try {
      const response = await client.post('/predictions', {
        version: REPLICATE_MODELS.TEXT_TO_VIDEO.version,
        input: { prompt: textPrompt, ...(style && { style }) },
      });
      return response.data.id;
    } catch (error) {
      logger.error('Text to video generation failed:', error);
      throw new Error('Failed to generate video from text');
    }
  }

  static async generateImageToVideo(imageUrl: string, textPrompt?: string, style?: string): Promise<string> {
    try {
      const response = await client.post('/predictions', {
        version: REPLICATE_MODELS.IMAGE_TO_VIDEO.version,
        input: { image: imageUrl, ...(textPrompt && { prompt: textPrompt }), ...(style && { style }) },
      });
      return response.data.id;
    } catch (error) {
      logger.error('Image to video generation failed:', error);
      throw new Error('Failed to generate video from image');
    }
  }

  static async generateMultipleImagesToVideo(imageUrls: string[], textPrompt?: string, style?: string): Promise<string> {
    try {
      const response = await client.post('/predictions', {
        version: REPLICATE_MODELS.MULTIPLE_IMAGES_TO_VIDEO.version,
        input: { images: imageUrls, ...(textPrompt && { prompt: textPrompt }), ...(style && { style }) },
      });
      return response.data.id;
    } catch (error) {
      logger.error('Multiple images to video generation failed:', error);
      throw new Error('Failed to generate video from multiple images');
    }
  }

  static async getPrediction(predictionId: string) {
    try {
      const response = await client.get(`/predictions/${predictionId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get prediction status:', error);
      throw error;
    }
  }
}