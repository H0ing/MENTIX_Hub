import nodemailer from 'nodemailer';
import config from '../config/env.js';
import logger from './logger.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass
  }
});

export async function sendOTPEmail(to, otp, type) {
  const subject = type === 'email_verify' 
    ? 'Verify Your Email - MENTIX-Hub' 
    : 'Password Reset OTP - MENTIX-Hub';
  
  const purpose = type === 'email_verify'
    ? 'verify your email address'
    : 'reset your password';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">MENTIX-Hub</h2>
      <p>You requested to ${purpose}.</p>
      <p>Your one-time password (OTP) is:</p>
      <h1 style="color: #4F46E5; font-size: 48px; letter-spacing: 8px; text-align: center;">${otp}</h1>
      <p>This OTP will expire in <strong>15 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
      <hr />
      <p style="color: #6B7280; font-size: 12px;">This is an automated message from MENTIX-Hub. Please do not reply to this email.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html
    });
    
    logger.info(`Email sent: ${info.messageId}`, { to, type });
    return info;
  } catch (error) {
    logger.error('Email sending failed', { error: error.message, to, type });
    throw error;
  }
}

export async function sendPasswordResetEmail(to, otp) {
  return sendOTPEmail(to, otp, 'password_reset');
}