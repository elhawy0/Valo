import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';

const logger = createLogger('errorHandler');

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal server error';

  logger.error(`Error: ${message}`, { statusCode, path: req.path });

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      timestamp: new Date(),
    },
  });
};
