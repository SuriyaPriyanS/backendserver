import Activity from '../models/Activity.js';
import HealthMetric from '../models/HealthMetric.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS, PAGINATION } from '../config/constants.js';

// @desc    Log an activity
// @route   POST /api/activities
// @access  Private
export const logActivity = async (req, res, next) => {
  try {
    const activityData = {
      ...req.body,
      user: req.user.id,
      date: req.body.date || Date.now()
    };

    const activity = await Activity.create(activityData);

    // Update today's health metrics
    const activityDate = new Date(activity.date);
    activityDate.setHours(0, 0, 0, 0);

    let healthMetric = await HealthMetric.findOne({
      user: req.user.id,
      date: activityDate
    });

    if (!healthMetric) {
      healthMetric = await HealthMetric.create({
        user: req.user.id,
        date: activityDate
      });
    }

    await healthMetric.addSteps(
      activity.steps,
      activity.distance?.value,
      activity.duration,
      activity.calories
    );

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity history
// @route   GET /api/activities
// @access  Private
export const getActivities = async (req, res, next) => {
  try {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, type, startDate, endDate } = req.query;

    const query = { user: req.user.id };

    if (type) {
      query.type = type;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const activities = await Activity.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Activity.countDocuments(query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: activities.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Private
export const getActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return next(new AppError('Activity not found', HTTP_STATUS.NOT_FOUND));
    }

    if (activity.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private
export const updateActivity = async (req, res, next) => {
  try {
    let activity = await Activity.findById(req.params.id);

    if (!activity) {
      return next(new AppError('Activity not found', HTTP_STATUS.NOT_FOUND));
    }

    if (activity.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
    }

    activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
export const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return next(new AppError('Activity not found', HTTP_STATUS.NOT_FOUND));
    }

    if (activity.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
    }

    await activity.deleteOne();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity statistics
// @route   GET /api/activities/stats
// @access  Private
export const getActivityStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const activities = await Activity.find({
      user: req.user.id,
      date: { $gte: startDate }
    });

    // Calculate statistics
    const stats = {
      totalActivities: activities.length,
      totalDuration: activities.reduce((sum, a) => sum + a.duration, 0),
      totalCalories: activities.reduce((sum, a) => sum + a.calories, 0),
      totalDistance: activities.reduce((sum, a) => sum + (a.distance?.value || 0), 0),
      totalSteps: activities.reduce((sum, a) => sum + a.steps, 0),
      byType: {},
      byIntensity: {}
    };

    activities.forEach(activity => {
      // By type
      if (!stats.byType[activity.type]) {
        stats.byType[activity.type] = { count: 0, duration: 0, calories: 0 };
      }
      stats.byType[activity.type].count++;
      stats.byType[activity.type].duration += activity.duration;
      stats.byType[activity.type].calories += activity.calories;

      // By intensity
      if (!stats.byIntensity[activity.intensity]) {
        stats.byIntensity[activity.intensity] = { count: 0, duration: 0 };
      }
      stats.byIntensity[activity.intensity].count++;
      stats.byIntensity[activity.intensity].duration += activity.duration;
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
