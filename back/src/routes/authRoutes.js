import { Router } from 'express';
import {
  register,
  login,
  verifyEmail,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  resendOTP
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

authRoutes.post('/register',  catchAsync(register));
authRoutes.post('/login',  catchAsync(login));
authRoutes.post('/verify-email',  catchAsync(verifyEmail));
authRoutes.post('/refresh-token', catchAsync(refreshToken));
authRoutes.post('/logout', catchAsync(logout));
authRoutes.post('/forgot-password',  catchAsync(forgotPassword));
authRoutes.post('/reset-password',  catchAsync(resetPassword));
authRoutes.post('/resend-otp', catchAsync(resendOTP));


// authRoutes.post('/register', validate(registerSchema), register);
// authRoutes.post('/login', loginLimiter, validate(loginSchema), login);
// authRoutes.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
// authRoutes.post('/refresh-token', refreshToken);
// authRoutes.post('/logout', logout);
// authRoutes.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
// authRoutes.post('/reset-password', validate(resetPasswordSchema), resetPassword);
// authRoutes.post('/resend-otp', resendOTP);


export default authRoutes;