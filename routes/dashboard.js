import express from 'express';
import { getDashboard, getDailySummary, getInsights } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getDashboard);
router.get('/summary', getDailySummary);
router.get('/insights', getInsights);

export default router;
