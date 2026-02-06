const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../utils/errorHandler');
require('dotenv').config();

/**
 * Generate JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  
  if (existingUser) {
    return next(new AppError('Email already registered', 400));
  }

  // Create new user
  const user = await User.create(email, password, role);

  // Generate token
  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findByEmail(email);

  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check password
  const isPasswordValid = await User.comparePassword(password, user.password);

  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Generate token
  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    }
  });
});

/**
 * @route   GET /api/v1/auth/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.findAll();

  res.status(200).json({
    success: true,
    count: users.length,
    data: {
      users
    }
  });
});

module.exports = {
  register,
  login,
  getMe,
  getAllUsers
};
