import { findByEmail, findByUsername, create, updateStatus, updateLastLogin, incrementTokenVersion, findById } from '../repositories/userRepository.js';
import { create as createToken, findByToken, deleteByToken, deleteAllByUserId } from '../repositories/tokenRepository.js';
import { create as createOTP, findLatestByUserAndType, markAsUsed } from '../repositories/otpRepository.js';
import { log } from '../repositories/auditRepository.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateOTP } from '../utils/otpGenerator.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../utils/email.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { success, created } from '../utils/response.js';

async function register(req, res) {
  const { email, username, password, full_name } = req.body;
  
  const emailCheck = await findByEmail(email);
  if (emailCheck.rows.length > 0) {
    throw new AppError('Email is already registered.', 409);
  }
  
  const usernameCheck = await findByUsername(username);
  if (usernameCheck.rows.length > 0) {
    throw new AppError('Username is already taken.', 409);
  }
  
  const password_hash = await hashPassword(password);
  
  const result = await create({
    username,
    email,
    password_hash,
    full_name: full_name || null,
    role: 'student'
  });
  
  const userId = result.rows.insertId;
  
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  
  await createOTP(userId, otp, 'email_verify', expiresAt);
  
  sendOTPEmail(email, otp, 'email_verify').catch(function(err) {
    console.error('Failed to send verification email:', err.message);
  });
  
  created(res, { userId }, 'Registration successful. Please verify your email with the OTP sent.');
}

async function login(req, res) {
  const { email, password } = req.body;
  
  const userResult = await findByEmail(email);
  if (!userResult.rows.length) {
    throw new AppError('Invalid email or password.', 401);
  }
  
  const user = userResult.rows[0];
  
  if (user.status === 'banned') {
    throw new AppError('Your account has been banned. Please contact support.', 403);
  }
  
  if (user.status === 'suspended') {
    throw new AppError('Your account has been suspended. Please contact support.', 403);
  }
  
  if (user.status === 'pending') {
    throw new AppError('Please verify your email before logging in.', 401);
  }
  
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    await log({
      admin_id: user.id,
      admin_role: user.role,
      action_type: 'LOGIN_FAILED',
      target_type: 'user',
      target_id: user.id,
      method: 'POST',
      ip_address: req.ip,
      details: { reason: 'invalid_password' }
    });
    
    throw new AppError('Invalid email or password.', 401);
  }
  
  const accessToken = await signAccessToken(user.id, user.role);
  const refreshToken = await signRefreshToken(user.id, user.token_version);
  
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await createToken(user.id, refreshToken, refreshExpiresAt);
  
  await updateLastLogin(user.id);
  
  await log({
    admin_id: user.id,
    admin_role: user.role,
    action_type: 'LOGIN_SUCCESS',
    target_type: 'user',
    target_id: user.id,
    method: 'POST',
    ip_address: req.ip,
    details: null
  });
  
  success(res, {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url
    },
    accessToken,
    refreshToken
  }, 'Login successful.');
}

async function verifyEmail(req, res) {
  const { email, otp } = req.body;
  
  const userResult = await findByEmail(email);
  if (!userResult.rows.length) {
    throw new AppError('No account found with this email.', 404);
  }
  
  const user = userResult.rows[0];
  
  if (user.status !== 'pending') {
    throw new AppError('Email is already verified.', 400);
  }
  
  const otpResult = await findLatestByUserAndType(user.id, 'email_verify');
  if (!otpResult.rows.length) {
    throw new AppError('OTP has expired or does not exist. Please request a new one.', 400);
  }
  
  const otpRecord = otpResult.rows[0];
  
  if (otpRecord.otp_code !== otp) {
    throw new AppError('Invalid OTP. Please try again.', 400);
  }
  
  await markAsUsed(otpRecord.id);
  
  await updateStatus(user.id, 'active');
  
  success(res, null, 'Email verified successfully. You can now log in.');
}

async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw new AppError('Refresh token is required.', 400);
  }
  
  const decoded = await verifyRefreshToken(refreshToken);
  // console.log('Decoded userId:', decoded.userId); // Add this to debug
  
  const tokenResult = await findByToken(refreshToken);
  // console.log(tokenResult)
  // console.log(tokenResult.rows)
  if (!tokenResult.rows.length) {
    throw new AppError('Invalid refresh token. Please log in again.', 401);
  }
  
  const userResult = await findById(decoded.userId);
  if (!userResult.rows.length) {
    throw new AppError('User not found.', 404);
  }
  
  const user = userResult.rows[0];
  
  if (decoded.version !== user.token_version) {
    await deleteByToken(refreshToken);
    throw new AppError('Token version mismatch. Please log in again.', 401);
  }
  
  await deleteByToken(refreshToken);
  
  const newAccessToken = await signAccessToken(user.id, user.role);
  const newRefreshToken = await signRefreshToken(user.id, user.token_version);
  
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await createToken(user.id, newRefreshToken, refreshExpiresAt);
  
  success(res, {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  }, 'Token refreshed successfully.');
}

async function logout(req, res) {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    await deleteByToken(refreshToken);
  }
  
  success(res, null, 'Logged out successfully.');
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  
  const userResult = await findByEmail(email);
  if (!userResult.rows.length) {
    success(res, null, 'If an account exists with this email, a password reset OTP has been sent.');
    return;
  }
  
  const user = userResult.rows[0];
  
  if (user.status === 'banned') {
    success(res, null, 'If an account exists with this email, a password reset OTP has been sent.');
    return;
  }
  
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  
  await createOTP(user.id, otp, 'password_reset', expiresAt);
  
  sendPasswordResetEmail(email, otp).catch(function(err) {
    console.error('Failed to send password reset email:', err.message);
  });
  
  success(res, null, 'If an account exists with this email, a password reset OTP has been sent.');
}

async function resetPassword(req, res) {
  const { email, otp, new_password } = req.body;
  
  const userResult = await findByEmail(email);
  if (!userResult.rows.length) {
    throw new AppError('Invalid or expired OTP.', 400);
  }
  
  const user = userResult.rows[0];
  
  const otpResult = await findLatestByUserAndType(user.id, 'password_reset');
  if (!otpResult.rows.length) {
    throw new AppError('Invalid or expired OTP.', 400);
  }
  
  const otpRecord = otpResult.rows[0];
  
  if (otpRecord.otp_code !== otp) {
    throw new AppError('Invalid OTP. Please try again.', 400);
  }
  
  await markAsUsed(otpRecord.id);
  
  const password_hash = await hashPassword(new_password);
  
  await incrementTokenVersion(user.id);
  
  await deleteAllByUserId(user.id);
  
  await updatePassword(user.id, password_hash);
  
  await log({
    admin_id: user.id,
    admin_role: user.role,
    action_type: 'PASSWORD_RESET',
    target_type: 'user',
    target_id: user.id,
    method: 'POST',
    ip_address: req.ip,
    details: null
  });
  
  success(res, null, 'Password reset successful. Please log in with your new password.');
}

async function resendOTP(req, res) {
  const { email, type } = req.body;
  
  const userResult = await findByEmail(email);
  if (!userResult.rows.length) {
    success(res, null, 'If an account exists with this email, a new OTP has been sent.');
    return;
  }
  
  const user = userResult.rows[0];
  
  const otpType = type === 'password_reset' ? 'password_reset' : 'email_verify';
  
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  
  await createOTP(user.id, otp, otpType, expiresAt);
  
  if (otpType === 'password_reset') {
    sendPasswordResetEmail(email, otp).catch(function(err) {
      console.error('Failed to send password reset email:', err.message);
    });
  } else {
    sendOTPEmail(email, otp, 'email_verify').catch(function(err) {
      console.error('Failed to send verification email:', err.message);
    });
  }
  
  success(res, null, 'A new OTP has been sent to your email.');
}

export {
  register,
  login,
  verifyEmail,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  resendOTP
};