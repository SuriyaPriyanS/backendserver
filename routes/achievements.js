import express from 'express';
import { 
  getAllAchievements, 
  getUserAchievements, 
  getAchievementProgress 
} from '../controllers/achievementController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getAllAchievements);
router.get('/user', getUserAchievements);
router.get('/:id/progress', getAchievementProgress);

export default router;
