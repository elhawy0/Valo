export interface User {
  id: string;
  email: string;
  name: string;
  apiKey: string;
  tier: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  userId: string;
  jobId: string;
  type: 'text-to-video' | 'image-to-video' | 'multiple-images-to-video';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  resolution: string;
  fps: number;
  fileSize?: number;
  processingTime?: number;
  error?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

export interface VideoGenerationRequest {
  textPrompt?: string;
  imageUrl?: string;
  imageUrls?: string[];
  style?: string;
  duration?: number;
  fps?: number;
  resolution?: '480p' | '720p' | '1080p';
  effects?: string[];
}

export interface JobData {
  userId: string;
  videoId: string;
  type: string;
  request: VideoGenerationRequest;
  replicateModelId: string;
}

export interface AnalyticsData {
  userId: string;
  date: Date;
  videosGenerated: number;
  totalProcessingTime: number;
  successRate: number;
  averageResolution: string;
  apiCalls: number;
  costEstimate: number;
}
