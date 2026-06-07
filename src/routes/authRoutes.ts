import { Router, Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { registerUser, loginUser } from '../services/authService';

const router = Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      throw new AppError(400, 'email, name, and password are required');
    }

    const result = await registerUser(email, name, password);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
        apiKey: result.apiKey,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'email and password are required');
    }

    const result = await loginUser(email, password);

    res.json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
