import express from 'express';
import { 
  getHealthMetrics, 
  getTodayMetrics, 
  updateSteps, 
  logWater, 
  getWellnessScore,
  getMetricTrends 
} from '../controllers/healthMetricController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/metrics', getHealthMetrics);
router.get('/metrics/today', getTodayMetrics);
router.put('/metrics/steps', updateSteps);
router.put('/metrics/water', logWater);
router.get('/wellness-score', getWellnessScore);
router.get('/trends', getMetricTrends);

export default router;
