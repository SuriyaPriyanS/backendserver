import Meal from '../models/Meal.js';
import HealthMetric from '../models/HealthMetric.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS, PAGINATION } from '../config/constants.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// @desc    Log a meal
// @route   POST /api/nutrition/meals
// @access  Private
export const logMeal = async (req, res, next) => {
  try {
    const { mealType, foods, date, time, notes, tags } = req.body;

    const meal = await Meal.create({
      user: req.user.id,
      mealType,
      foods,
      date: date || Date.now(),
      time,
      notes,
      tags
    });

    // Update today's health metrics
    const mealDate = new Date(meal.date);
    mealDate.setHours(0, 0, 0, 0);

    let healthMetric = await HealthMetric.findOne({
      user: req.user.id,
      date: mealDate
    });

    if (!healthMetric) {
      healthMetric = await HealthMetric.create({
        user: req.user.id,
        date: mealDate
      });
    }

    await healthMetric.addMeal(meal.totalCalories, meal.totalMacros);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meal history
// @route   GET /api/nutrition/meals
// @access  Private
export const getMeals = async (req, res, next) => {
  try {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, mealType, startDate, endDate } = req.query;

    const query = { user: req.user.id };

    if (mealType) {
      query.mealType = mealType;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const meals = await Meal.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Meal.countDocuments(query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: meals.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: meals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single meal
// @route   GET /api/nutrition/meals/:id
// @access  Private
export const getMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return next(new AppError('Meal not found', HTTP_STATUS.NOT_FOUND));
    }

    // Ensure meal belongs to user
    if (meal.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meal
// @route   PUT /api/nutrition/meals/:id
// @access  Private
export const updateMeal = async (req, res, next) => {
  try {
    let meal = await Meal.findById(req.params.id);

    if (!meal) {
      return next(new AppError('Meal not found', HTTP_STATUS.NOT_FOUND));
    }

    if (meal.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
    }

    meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete meal
// @route   DELETE /api/nutrition/meals/:id
// @access  Private
export const deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return next(new AppError('Meal not found', HTTP_STATUS.NOT_FOUND));
    }

    if (meal.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
    }

    // Delete image from Cloudinary if exists
    if (meal.image?.publicId) {
      await deleteFromCloudinary(meal.image.publicId);
    }

    await meal.deleteOne();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload meal image
// @route   POST /api/nutrition/meals/:id/image
// @access  Private
export const uploadMealImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    const meal = await Meal.findById(req.params.id);

    if (!meal) return next(new AppError('Meal not found', 404));
    if (meal.user.toString() !== req.user.id) return next(new AppError('Not authorized', 403));

    // Delete old image
    if (meal.image?.publicId) {
      await deleteFromCloudinary(meal.image.publicId);
    }

    // Upload new image
    const result = await uploadToCloudinary(req.file.buffer, 'meals');

    meal.image = {
      url: result.secure_url,
      publicId: result.public_id
    };
    await meal.save();

    res.status(200).json({ success: true, data: { image: meal.image } });
  } catch (error) {
    next(error);
  }
};


// @desc    Get nutrition analytics
// @route   GET /api/nutrition/analytics
// @access  Private
export const getNutritionAnalytics = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      user: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Calculate daily totals
    const dailyTotals = {};
    meals.forEach(meal => {
      const dateKey = meal.date.toISOString().split('T')[0];
      if (!dailyTotals[dateKey]) {
        dailyTotals[dateKey] = {
          date: dateKey,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          mealCounts: {}
        };
      }

      dailyTotals[dateKey].calories += meal.totalCalories;
      dailyTotals[dateKey].protein += meal.totalMacros.protein;
      dailyTotals[dateKey].carbs += meal.totalMacros.carbs;
      dailyTotals[dateKey].fat += meal.totalMacros.fat;
      dailyTotals[dateKey].fiber += meal.totalMacros.fiber;

      dailyTotals[dateKey].mealCounts[meal.mealType] = 
        (dailyTotals[dateKey].mealCounts[meal.mealType] || 0) + 1;
    });

    const analytics = Object.values(dailyTotals);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};
