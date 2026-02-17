import express from 'express';
import { getProfile, updateProfile, uploadAvatar, getUserStats, deleteAccount } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.get('/stats', getUserStats);
router.delete('/account', deleteAccount);

export default router;
