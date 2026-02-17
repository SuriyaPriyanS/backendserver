import Goal from '../models/Goal.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '../config/constants.js';

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res, next) => {
  try {
    const goalData = {
      ...req.body,
      user: req.user.id
    };

    const goal = await Goal.create(goalData);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user goals
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res, next) => {
  try {
    const { status, type } = req.query;

    const query = { user: req.user.id };

    if (status) query.status = status;
    if (type) query.type = type;

    const goals = await Goal.find(query).sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
export const getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return next(new AppError('Goal not found', HTTP_STATUS.NOT_FOUND));
    }

    if (goal.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return next(new AppError('Goal not found', HTTP_STATUS.NOT_FOUND));
    }

    if (goal.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
    }

    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return next(new AppError('Goal not found', HTTP_STATUS.NOT_FOUND));
    }

    if (goal.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
    }

    await goal.deleteOne();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a goal
// @route   POST /api/goals/:id/complete
// @access  Private
export const completeGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return next(new AppError('Goal not found', HTTP_STATUS.NOT_FOUND));
    }

    if (goal.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
    }

    goal.status = 'completed';
    goal.completedDate = new Date();
    goal.progress = 100;
    await goal.save();

    // Award points to user
    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalPoints: 50 } // Award 50 points for completing a goal
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal progress
// @route   PUT /api/goals/:id/progress
// @access  Private
export const updateGoalProgress = async (req, res, next) => {
  try {
    const { currentValue } = req.body;

    if (typeof currentValue !== 'number') {
      return next(new AppError('currentValue must be a number', HTTP_STATUS.BAD_REQUEST));
    }

    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return next(new AppError('Goal not found', HTTP_STATUS.NOT_FOUND));
    }

    if (goal.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
    }

    await goal.updateProgress(currentValue);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};
