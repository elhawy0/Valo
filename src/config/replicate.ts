export const REPLICATE_MODELS = {
  TEXT_TO_VIDEO: {
    model: 'minimax/video-01',
    version: 'latest',
  },
  IMAGE_TO_VIDEO: {
    model: 'minimax/video-01',
    version: 'latest',
  },
  MULTIPLE_IMAGES_TO_VIDEO: {
    model: 'minimax/video-01',
    version: 'latest',
  },
};

export const REPLICATE_API_URL = 'https://api.replicate.com/v1';
export const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  throw new Error('REPLICATE_API_TOKEN environment variable is required');
}