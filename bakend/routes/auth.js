import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  logout,
  googleAuthCallback,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { isDbConnected } from '../utils/userStore.js';

const router = express.Router();

const ensureGoogleReady = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Google sign-in is not configured yet.',
    });
  }
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected. Google login is unavailable.',
    });
  }
  return next();
};

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!', timestamp: new Date().toISOString() });
});

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.get('/logout', logout);

// Google OAuth routes
router.get(
  '/google',
  ensureGoogleReady,
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  ensureGoogleReady,
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`,
    session: false,
  }),
  googleAuthCallback
);

export default router;
