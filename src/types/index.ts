export interface VideoGenerationRequest {
  textPrompt?: string;
  imageUrl?: string;
  imageUrls?: string[];
  style?: string;
}

export interface ReplicateResponse {
  id: string;
  status: string;
  output?: string | string[];
  error?: string;
}

export interface VideoJobData {
  jobId: string;
  userId: string;
  type: 'TEXT_TO_VIDEO' | 'IMAGE_TO_VIDEO' | 'MULTIPLE_IMAGES_TO_VIDEO';
  textPrompt?: string;
  imageUrl?: string;
  imageUrls?: string[];
  style?: string;
}