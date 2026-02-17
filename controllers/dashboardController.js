import User from '../models/User.js';
import HealthMetric from '../models/HealthMetric.js';
import Activity from '../models/Activity.js';
import Goal from '../models/Goal.js';
import UserAchievement from '../models/UserAchievement.js';
import Meal from '../models/Meal.js';
import { HTTP_STATUS, WELLNESS_WEIGHTS } from '../config/constants.js';

// @desc    Get comprehensive dashboard data
// @route   GET /api/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's metrics with upsert to handle race conditions
    const todayMetrics = await HealthMetric.findOneAndUpdate(
      { user: req.user.id, date: today },
      { $setOnInsert: { user: req.user.id, date: today } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Get recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentActivities, activeGoals, recentAchievements, weeklyMetrics] = await Promise.all([
      Activity.find({ user: req.user.id, date: { $gte: sevenDaysAgo } })
        .sort({ date: -1 })
        .limit(5),
      Goal.find({ user: req.user.id, status: 'active' }).limit(3),
      UserAchievement.find({ user: req.user.id, earned: true })
        .populate('achievement')
        .sort({ earnedDate: -1 })
        .limit(3),
      HealthMetric.find({ user: req.user.id, date: { $gte: sevenDaysAgo } })
        .sort({ date: 1 })
    ]);

    // Calculate wellness score
    const stepsScore = Math.min((todayMetrics.steps.current / todayMetrics.steps.target) * 100, 100);
    const caloriesScore = Math.min((todayMetrics.calories.consumed / todayMetrics.calories.target) * 100, 100);
    const waterScore = Math.min((todayMetrics.water.current / todayMetrics.water.target) * 100, 100);
    const sleepScore = Math.min((todayMetrics.sleep.duration / todayMetrics.sleep.target) * 100, 100);

    const wellnessScore = Math.round(
      stepsScore * WELLNESS_WEIGHTS.STEPS +
      caloriesScore * WELLNESS_WEIGHTS.CALORIES +
      waterScore * WELLNESS_WEIGHTS.WATER +
      sleepScore * WELLNESS_WEIGHTS.SLEEP
    );

    // Weekly summary
    const weeklySummary = {
      totalActivities: recentActivities.length,
      totalCalories: recentActivities.reduce((sum, a) => sum + a.calories, 0),
      totalDistance: recentActivities.reduce((sum, a) => sum + (a.distance?.value || 0), 0),
      avgWellnessScore: weeklyMetrics.length > 0 
        ? Math.round(weeklyMetrics.reduce((sum, m) => {
            const score = Math.round(
              Math.min((m.steps.current / m.steps.target) * 100, 100) * WELLNESS_WEIGHTS.STEPS +
              Math.min((m.calories.consumed / m.calories.target) * 100, 100) * WELLNESS_WEIGHTS.CALORIES +
              Math.min((m.water.current / m.water.target) * 100, 100) * WELLNESS_WEIGHTS.WATER +
              Math.min((m.sleep.duration / m.sleep.target) * 100, 100) * WELLNESS_WEIGHTS.SLEEP
            );
            return sum + score;
          }, 0) / weeklyMetrics.length)
        : 0
    };

    const dashboardData = {
      user: user.getPublicProfile(),
      todayMetrics,
      wellnessScore,
      weeklySummary,
      recentActivities,
      activeGoals,
      recentAchievements
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily summary
// @route   GET /api/dashboard/summary
// @access  Private
export const getDailySummary = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const [metrics, meals, activities] = await Promise.all([
      HealthMetric.findOne({ user: req.user.id, date: targetDate }),
      Meal.find({ user: req.user.id, date: targetDate }),
      Activity.find({ user: req.user.id, date: targetDate })
    ]);

    const summary = {
      date: targetDate,
      metrics: metrics || {},
      meals: {
        count: meals.length,
        totalCalories: meals.reduce((sum, m) => sum + m.totalCalories, 0),
        byType: meals.reduce((acc, m) => {
          acc[m.mealType] = (acc[m.mealType] || 0) + 1;
          return acc;
        }, {})
      },
      activities: {
        count: activities.length,
        totalDuration: activities.reduce((sum, a) => sum + a.duration, 0),
        totalCalories: activities.reduce((sum, a) => sum + a.calories, 0)
      }
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get insights and recommendations
// @route   GET /api/dashboard/insights
// @access  Private
export const getInsights = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const metrics = await HealthMetric.find({
      user: req.user.id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    const insights = [];

    if (metrics.length > 0) {
      // Steps insight
      const avgSteps = metrics.reduce((sum, m) => sum + m.steps.current, 0) / metrics.length;
      const stepsGoalMet = metrics.filter(m => m.steps.current >= m.steps.target).length;
      const stepsSuccessRate = (stepsGoalMet / metrics.length) * 100;

      insights.push({
        type: 'steps',
        message: `Your average daily steps are ${Math.round(avgSteps)}. You've met your step goal ${stepsSuccessRate.toFixed(0)}% of the time.`,
        recommendation: avgSteps < 8000 
          ? 'Try to increase your daily activity by taking short walks throughout the day.'
          : 'Great job! Keep maintaining your active lifestyle.'
      });

      // Water intake insight
      const avgWater = metrics.reduce((sum, m) => sum + m.water.current, 0) / metrics.length;
      const waterGoalMet = metrics.filter(m => m.water.current >= m.water.target).length;

      insights.push({
        type: 'water',
        message: `Your average daily water intake is ${Math.round(avgWater)}ml.`,
        recommendation: avgWater < 2000
          ? 'Consider setting reminders to drink water throughout the day.'
          : 'Excellent hydration habits! Keep it up.'
      });

      // Sleep insight
      const avgSleep = metrics.reduce((sum, m) => sum + m.sleep.duration, 0) / metrics.length;
      
      insights.push({
        type: 'sleep',
        message: `Your average sleep duration is ${avgSleep.toFixed(1)} hours per night.`,
        recommendation: avgSleep < 7
          ? 'Aim for 7-9 hours of sleep per night for optimal health.'
          : 'Your sleep schedule looks healthy!'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: insights
    });
  } catch (error) {
    next(error);
  }
};
