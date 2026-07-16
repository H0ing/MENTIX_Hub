/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

import { Router } from 'express';
import {
  register,
  login,
  verifyEmail,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  resendOTP,
  verifyOTP
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../utils/validators.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import catchAsync from '../utils/catchAsync.js';

const authRoutes = Router();

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
authRoutes.post('/register',  catchAsync(register));

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
authRoutes.post('/login',  catchAsync(login));

/**
 * @swagger
 * /api/verify-email:
 *   post:
 *     summary: Verify email address
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
authRoutes.post('/verify-email',  catchAsync(verifyEmail));

/**
 * @swagger
 * /api/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
authRoutes.post('/refresh-token', catchAsync(refreshToken));

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
authRoutes.post('/logout', catchAsync(logout));

/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
authRoutes.post('/forgot-password',  catchAsync(forgotPassword));

/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
authRoutes.post('/reset-password',  catchAsync(resetPassword));

/**
 * @swagger
 * /api/resend-otp:
 *   post:
 *     summary: Resend OTP code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP resent successfully
 */
authRoutes.post('/resend-otp', catchAsync(resendOTP));

/**
 * @swagger
 * /api/verify-otp:
 *   post:
 *     summary: Verify OTP code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
authRoutes.post('/verify-otp', catchAsync(verifyOTP));


// authRoutes.post('/register', validate(registerSchema), register);
// authRoutes.post('/login', loginLimiter, validate(loginSchema), login);
// authRoutes.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
// authRoutes.post('/refresh-token', refreshToken);
// authRoutes.post('/logout', logout);
// authRoutes.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
// authRoutes.post('/reset-password', validate(resetPasswordSchema), resetPassword);
// authRoutes.post('/resend-otp', resendOTP);


export default authRoutes;