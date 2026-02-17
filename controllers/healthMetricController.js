import HealthMetric from '../models/HealthMetric.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS, WELLNESS_WEIGHTS } from '../config/constants.js';

// @desc    Get health metrics for a date range
// @route   GET /api/health/metrics
// @access  Private
export const getHealthMetrics = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;

    const query = { user: req.user.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const metrics = await HealthMetric.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: metrics.length,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get health metrics for today
// @route   GET /api/health/metrics/today
// @access  Private
export const getTodayMetrics = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Use findOneAndUpdate with upsert to handle race conditions
    const metrics = await HealthMetric.findOneAndUpdate(
      { user: req.user.id, date: today },
      { $setOnInsert: { user: req.user.id, date: today } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update steps
// @route   PUT /api/health/metrics/steps
// @access  Private
export const updateSteps = async (req, res, next) => {
  try {
    const { steps, distance, activeMinutes, caloriesBurned } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Use findOneAndUpdate with upsert to handle race conditions
    const metrics = await HealthMetric.findOneAndUpdate(
      { user: req.user.id, date: today },
      { $setOnInsert: { user: req.user.id, date: today } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await metrics.addSteps(steps, distance, activeMinutes, caloriesBurned);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log water intake
// @route   PUT /api/health/metrics/water
// @access  Private
export const logWater = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return next(new AppError('Amount must be a positive number', HTTP_STATUS.BAD_REQUEST));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Use findOneAndUpdate with upsert to handle race conditions
    const metrics = await HealthMetric.findOneAndUpdate(
      { user: req.user.id, date: today },
      { $setOnInsert: { user: req.user.id, date: today } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await metrics.addWater(amount);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wellness score
// @route   GET /api/health/wellness-score
// @access  Private
export const getWellnessScore = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metrics = await HealthMetric.findOne({
      user: req.user.id,
      date: today
    });

    if (!metrics) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { score: 0, breakdown: {} }
      });
    }

    // Calculate individual scores
    const stepsScore = Math.min((metrics.steps.current / metrics.steps.target) * 100, 100);
    const caloriesScore = Math.min((metrics.calories.consumed / metrics.calories.target) * 100, 100);
    const waterScore = Math.min((metrics.water.current / metrics.water.target) * 100, 100);
    const sleepScore = Math.min((metrics.sleep.duration / metrics.sleep.target) * 100, 100);

    // Calculate weighted wellness score
    const wellnessScore = Math.round(
      stepsScore * WELLNESS_WEIGHTS.STEPS +
      caloriesScore * WELLNESS_WEIGHTS.CALORIES +
      waterScore * WELLNESS_WEIGHTS.WATER +
      sleepScore * WELLNESS_WEIGHTS.SLEEP
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        score: wellnessScore,
        breakdown: {
          steps: Math.round(stepsScore),
          calories: Math.round(caloriesScore),
          water: Math.round(waterScore),
          sleep: Math.round(sleepScore)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get metric trends
// @route   GET /api/health/trends
// @access  Private
export const getMetricTrends = async (req, res, next) => {
  try {
    const { metric = 'steps', days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const metrics = await HealthMetric.find({
      user: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const trendData = metrics.map(m => ({
      date: m.date,
      value: m[metric]?.current || 0,
      target: m[metric]?.target || 0
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: trendData
    });
  } catch (error) {
    next(error);
  }
};
