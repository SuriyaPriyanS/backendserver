import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '../config/constants.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user.getPublicProfile()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'dateOfBirth', 'gender', 'height', 'weight', 'preferences'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user.getPublicProfile()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a file', HTTP_STATUS.BAD_REQUEST));
    }

    const user = await User.findById(req.user.id);

    // Delete old avatar from Cloudinary if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await deleteFromCloudinary(publicId);
    }

    // Upload new avatar to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'avatars');

    user.avatar = result.secure_url;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Import models dynamically to avoid circular dependencies
    const HealthMetric = (await import('../models/HealthMetric.js')).default;
    const Activity = (await import('../models/Activity.js')).default;
    const Goal = (await import('../models/Goal.js')).default;
    const UserAchievement = (await import('../models/UserAchievement.js')).default;

    // Get various statistics
    const [totalActivities, activeGoals, earnedAchievements, recentMetrics] = await Promise.all([
      Activity.countDocuments({ user: req.user.id }),
      Goal.countDocuments({ user: req.user.id, status: 'active' }),
      UserAchievement.countDocuments({ user: req.user.id, earned: true }),
      HealthMetric.find({ user: req.user.id }).sort({ date: -1 }).limit(7)
    ]);

    const stats = {
      memberSince: user.memberSince,
      currentStreak: user.currentStreak,
      totalPoints: user.totalPoints,
      totalActivities,
      activeGoals,
      earnedAchievements,
      weeklyProgress: recentMetrics.length
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
