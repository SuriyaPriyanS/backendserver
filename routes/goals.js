import express from 'express';
import { 
  createGoal, 
  getGoals, 
  getGoal, 
  updateGoal, 
  deleteGoal,
  completeGoal,
  updateGoalProgress 
} from '../controllers/goalController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .get(getGoal)
  .put(updateGoal)
  .delete(deleteGoal);

router.post('/:id/complete', completeGoal);
router.put('/:id/progress', updateGoalProgress);

export default router;
