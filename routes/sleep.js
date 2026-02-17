import express from 'express';
import { 
  logSleep, 
  getSleepHistory, 
  getSleep, 
  updateSleep, 
  deleteSleep,
  getSleepAnalysis 
} from '../controllers/sleepController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .get(getSleepHistory)
  .post(logSleep);

router.get('/analysis', getSleepAnalysis);

router.route('/:id')
  .get(getSleep)
  .put(updateSleep)
  .delete(deleteSleep);

export default router;
