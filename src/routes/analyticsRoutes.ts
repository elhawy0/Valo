import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { getUserAnalytics } from '../services/analyticsService';

const router = Router();

router.use(authenticate);

router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const analytics = await getUserAnalytics(req.userId!, days);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
