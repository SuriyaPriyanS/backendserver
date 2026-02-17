import Sleep from '../models/Sleep.js';
import HealthMetric from '../models/HealthMetric.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS, PAGINATION } from '../config/constants.js';

// @desc    Log sleep session
// @route   POST /api/sleep
// @access  Private
export const logSleep = async (req, res, next) => {
  try {
    const sleepData = {
      ...req.body,
      user: req.user.id,
      date: req.body.date || new Date().toISOString().split('T')[0]
    };

    const sleep = await Sleep.create(sleepData);

    // Update health metrics
    const sleepDate = new Date(sleep.date);
    sleepDate.setHours(0, 0, 0, 0);

    let healthMetric = await HealthMetric.findOne({
      user: req.user.id,
      date: sleepDate
    });

    if (!healthMetric) {
      healthMetric = await HealthMetric.create({
        user: req.user.id,
        date: sleepDate
      });
    }

    healthMetric.sleep.duration = sleep.durationMinutes / 60;
    healthMetric.sleep.quality = sleep.quality;
    healthMetric.sleep.bedtime = sleep.bedtime;
    healthMetric.sleep.wakeTime = sleep.wakeTime;
    
    const deepPhase = sleep.phases.find(p => p.type === 'deep');
    const lightPhase = sleep.phases.find(p => p.type === 'light');
    const remPhase = sleep.phases.find(p => p.type === 'rem');

    if (deepPhase) healthMetric.sleep.deepSleep = deepPhase.duration / 60;
    if (lightPhase) healthMetric.sleep.lightSleep = lightPhase.duration / 60;
    if (remPhase) healthMetric.sleep.remSleep = remPhase.duration / 60;

    await healthMetric.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: sleep
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sleep history
// @route   GET /api/sleep
// @access  Private
export const getSleepHistory = async (req, res, next) => {
  try {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, startDate, endDate } = req.query;

    const query = { user: req.user.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sleepData = await Sleep.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Sleep.countDocuments(query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: sleepData.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: sleepData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sleep session
// @route   GET /api/sleep/:id
// @access  Private
export const getSleep = async (req, res, next) => {
  try {
    const sleep = await Sleep.findById(req.params.id);

    if (!sleep) {
      return next(new AppError('Sleep session not found', HTTP_STATUS.NOT_FOUND));
    }

    if (sleep.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: sleep
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sleep session
// @route   PUT /api/sleep/:id
// @access  Private
export const updateSleep = async (req, res, next) => {
  try {
    let sleep = await Sleep.findById(req.params.id);

    if (!sleep) {
      return next(new AppError('Sleep session not found', HTTP_STATUS.NOT_FOUND));
    }

    if (sleep.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
    }

    sleep = await Sleep.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: sleep
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sleep session
// @route   DELETE /api/sleep/:id
// @access  Private
export const deleteSleep = async (req, res, next) => {
  try {
    const sleep = await Sleep.findById(req.params.id);

    if (!sleep) {
      return next(new AppError('Sleep session not found', HTTP_STATUS.NOT_FOUND));
    }

    if (sleep.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
    }

    await sleep.deleteOne();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Sleep session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sleep analysis
// @route   GET /api/sleep/analysis
// @access  Private
export const getSleepAnalysis = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const sleepData = await Sleep.find({
      user: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    if (sleepData.length === 0) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { message: 'No sleep data available for analysis' }
      });
    }

    // Calculate averages
    const totalDuration = sleepData.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalQuality = sleepData.reduce((sum, s) => sum + s.quality, 0);
    const totalConsistency = sleepData.reduce((sum, s) => sum + s.consistency, 0);

    const analysis = {
      averageDuration: (totalDuration / sleepData.length / 60).toFixed(2),
      averageQuality: Math.round(totalQuality / sleepData.length),
      averageConsistency: Math.round(totalConsistency / sleepData.length),
      totalNights: sleepData.length,
      bestNight: sleepData.reduce((best, current) => 
        current.quality > best.quality ? current : best
      ),
      worstNight: sleepData.reduce((worst, current) => 
        current.quality < worst.quality ? current : worst
      ),
      phaseAverages: {
        deep: (sleepData.reduce((sum, s) => {
          const deepPhase = s.phases.find(p => p.type === 'deep');
          return sum + (deepPhase?.duration || 0);
        }, 0) / sleepData.length).toFixed(0),
        light: (sleepData.reduce((sum, s) => {
          const lightPhase = s.phases.find(p => p.type === 'light');
          return sum + (lightPhase?.duration || 0);
        }, 0) / sleepData.length).toFixed(0),
        rem: (sleepData.reduce((sum, s) => {
          const remPhase = s.phases.find(p => p.type === 'rem');
          return sum + (remPhase?.duration || 0);
        }, 0) / sleepData.length).toFixed(0)
      }
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};
