import express from 'express';
import { 
  logActivity, 
  getActivities, 
  getActivity, 
  updateActivity, 
  deleteActivity,
  getActivityStats 
} from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .get(getActivities)
  .post(logActivity);

router.get('/stats', getActivityStats);

router.route('/:id')
  .get(getActivity)
  .put(updateActivity)
  .delete(deleteActivity);

export default router;
