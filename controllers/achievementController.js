import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '../config/constants.js';

// @desc    Get all available achievements
// @route   GET /api/achievements
// @access  Private
export const getAllAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ isActive: true }).sort({ order: 1, category: 1 });

    // Get user's achievements
    const userAchievements = await UserAchievement.find({ user: req.user.id });
    
    // Merge data
    const achievementsWithProgress = achievements.map(achievement => {
      const userAchv = userAchievements.find(ua => 
        ua.achievement.toString() === achievement._id.toString()
      );

      return {
        ...achievement.toObject(),
        earned: userAchv?.earned || false,
        earnedDate: userAchv?.earnedDate,
        progress: userAchv?.progress
      };
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: achievementsWithProgress.length,
      data: achievementsWithProgress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's earned achievements
// @route   GET /api/achievements/user
// @access  Private
export const getUserAchievements = async (req, res, next) => {
  try {
    const userAchievements = await UserAchievement.find({ 
      user: req.user.id, 
      earned: true 
    }).populate('achievement').sort({ earnedDate: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: userAchievements.length,
      data: userAchievements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get achievement progress
// @route   GET /api/achievements/:id/progress
// @access  Private
export const getAchievementProgress = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return next(new AppError('Achievement not found', HTTP_STATUS.NOT_FOUND));
    }

    let userAchievement = await UserAchievement.findOne({
      user: req.user.id,
      achievement: req.params.id
    });

    if (!userAchievement) {
      // Create if doesn't exist
      userAchievement = await UserAchievement.create({
        user: req.user.id,
        achievement: req.params.id,
        progress: { current: 0, target: achievement.criteria.threshold }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        achievement: achievement.toObject(),
        earned: userAchievement.earned,
        earnedDate: userAchievement.earnedDate,
        progress: userAchievement.progress
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check and unlock achievements (internal function)
// This is called by the system to automatically unlock achievements
export const checkAchievements = async (userId) => {
  try {
    const achievements = await Achievement.find({ isActive: true });
    const User = (await import('../models/User.js')).default;
    const HealthMetric = (await import('../models/HealthMetric.js')).default;
    const Activity = (await import('../models/Activity.js')).default;

    for (const achievement of achievements) {
      const userAchv = await UserAchievement.findOne({
        user: userId,
        achievement: achievement._id
      });

      // Skip if already earned
      if (userAchv?.earned) continue;

      let shouldUnlock = false;

      // Check criteria based on type
      switch (achievement.criteria.type) {
        case 'streak':
          const user = await User.findById(userId);
          if (user.currentStreak >= achievement.criteria.threshold) {
            shouldUnlock = true;
          }
          break;

        case 'count':
          if (achievement.criteria.metric === 'activities') {
            const count = await Activity.countDocuments({ user: userId });
            if (count >= achievement.criteria.threshold) {
              shouldUnlock = true;
            }
          }
          break;

        case 'value':
          // Check specific metric values
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const metrics = await HealthMetric.findOne({ user: userId, date: today });
          
          if (metrics && achievement.criteria.metric) {
            const metricPath = achievement.criteria.metric.split('.');
            let value = metrics;
            for (const path of metricPath) {
              value = value?.[path];
            }
            if (value >= achievement.criteria.threshold) {
              shouldUnlock = true;
            }
          }
          break;
      }

      if (shouldUnlock) {
        if (!userAchv) {
          const newUserAchv = await UserAchievement.create({
            user: userId,
            achievement: achievement._id,
            earned: true,
            earnedDate: new Date()
          });
          await newUserAchv.unlock();
        } else {
          await userAchv.unlock();
        }

        // Award points to user
        await User.findByIdAndUpdate(userId, {
          $inc: { totalPoints: achievement.points }
        });
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
};
