import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { isDbConnected } from '../utils/userStore.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  matchPassword,
  updateUserById,
} from '../utils/userStore.js';

const getJwtToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await findUserByEmail(email);

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create user
    const user = await createUser({
      name,
      email,
      password,
      role: role || 'student',
    });

    // Get token
    const token = getJwtToken(user);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await matchPassword(user, password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Get token
    const token = getJwtToken(user);

    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };

    const user = await updateUserById(req.user.id, fieldsToUpdate);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    // Check current password
    if (!(await matchPassword(user, req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect',
      });
    }

    if (isDbConnected()) {
      user.password = req.body.newPassword;
      await user.save();
    } else {
      user.password = await bcrypt.hash(req.body.newPassword, 10);
    }

    const token = getJwtToken(user);

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Google OAuth
// @route   GET /api/auth/google
// @access  Public
export const googleAuth = (req, res, next) => {
  // This will be handled by passport
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleAuthCallback = (req, res) => {
  try {
    if (!req.user || !req.user.getSignedJwtToken) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }

    const token = req.user.getSignedJwtToken();

    // Redirect to frontend with token so AuthContext can pick it up from the query string
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendBase}/auth/callback?token=${token}&provider=google`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: Date.now() + 15 * 60 * 1000,
    });

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendBase}/reset-password?token=${resetToken}`;

    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      text: `You requested a password reset. Open this link to reset: ${resetUrl}`,
      html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset your password</a></p>`,
    });

    res.status(200).json({
      success: true,
      message: emailResult.queued
        ? 'Password reset email sent'
        : 'SMTP not configured. Use the reset URL returned in response.',
      resetUrl: emailResult.queued ? undefined : resetUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/resetpassword
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected',
      });
    }

    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const jwtToken = getJwtToken(user);

    res.status(200).json({
      success: true,
      token: jwtToken,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Logout
// @route   GET /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
