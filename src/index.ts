import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createLogger } from './utils/logger';
import { connectDatabase } from './config/database';
import { initializeRedis, getRedisClient } from './config/redis';
import { initializeQueue } from './config/queue';
import videoRoutes from './routes/videoRoutes';
import authRoutes from './routes/authRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app: Express = express();
const logger = createLogger('app');
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(requestLogger);
app.use(rateLimiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Initialize and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected');

    // Initialize Redis
    await initializeRedis();
    logger.info('Redis connected');

    // Initialize Bull Queue
    await initializeQueue();
    logger.info('Job queue initialized');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
