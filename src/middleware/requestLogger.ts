import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';

const logger = createLogger('http');

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, path, body, query } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`${method} ${path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      query,
    });
  });

  next();
};
