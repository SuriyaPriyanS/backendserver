import express from 'express';
import { 
  logMeal, 
  getMeals, 
  getMeal, 
  updateMeal, 
  deleteMeal,
  uploadMealImage,
  getNutritionAnalytics 
} from '../controllers/nutritionController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/meals')
  .get(getMeals)
  .post(logMeal);

router.route('/meals/:id')
  .get(getMeal)
  .put(updateMeal)
  .delete(deleteMeal);

router.post('/meals/:id/image', upload.single('image'), uploadMealImage);
router.get('/analytics', getNutritionAnalytics);

export default router;
