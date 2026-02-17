import User from '../models/User.js';
import { sendTokenResponse } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '../config/constants.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, dateOfBirth, gender } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User already exists with this email', HTTP_STATUS.CONFLICT));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      dateOfBirth,
      gender
    });

    sendTokenResponse(user, HTTP_STATUS.CREATED, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', HTTP_STATUS.BAD_REQUEST));
    }

    // Get user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED));
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return next(new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, HTTP_STATUS.OK, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', HTTP_STATUS.BAD_REQUEST));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED));
    }

    sendTokenResponse(user, HTTP_STATUS.OK, res);
  } catch (error) {
    next(new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED));
  }
};
