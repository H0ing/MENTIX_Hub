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
      from: `"MENTIX-Hub" <${config.smtp.user}>`,
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

export async function sendReportResolutionEmail(to, { project_title, reason, resolution_type, resolution_message }) {
  const subject = `Report Resolution Update - ${project_title}`;

  const statusLabels = {
    warning: 'Warning Issued',
    project_removed: 'Project Removed',
    user_banned: 'User Banned',
    dismissed: 'Dismissed',
    other: 'Resolved'
  };

  const statusLabel = statusLabels[resolution_type] || resolution_type;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">MENTIX-Hub</h2>
      <p>Your report has been reviewed and resolved.</p>
      <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Project:</strong> ${project_title}</p>
        <p><strong>Reason reported:</strong> ${reason}</p>
        <p><strong>Resolution:</strong> ${statusLabel}</p>
        ${resolution_message ? `<p><strong>Message:</strong> ${resolution_message}</p>` : ''}
      </div>
      <p>Thank you for helping keep MENTIX-Hub a safe place.</p>
      <hr />
      <p style="color: #6B7280; font-size: 12px;">This is an automated message from MENTIX-Hub. Please do not reply to this email.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"MENTIX-Hub" <${config.smtp.user}>`,
      to,
      subject,
      html
    });
    logger.info(`Report resolution email sent: ${info.messageId}`, { to, resolution_type });
    return info;
  } catch (error) {
    logger.error('Report resolution email failed', { error: error.message, to, resolution_type });
    throw error;
  }
}

export async function sendPromotionDecisionEmail(to, { username, status, rejection_reason }) {
  const isApproved = status === 'approved';
  const subject = isApproved
    ? 'Congratulations! Your Mentor Promotion has been Approved - MENTIX-Hub'
    : 'Mentor Promotion Update - MENTIX-Hub';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">MENTIX-Hub</h2>
      ${isApproved ? `
        <h3>Congratulations ${username}!</h3>
        <p>Your request to become a mentor has been <strong style="color: #10B981;">approved</strong>.</p>
        <p>You can now start mentoring students and helping them grow in their projects.</p>
      ` : `
        <h3>Promotion Update</h3>
        <p>Your request to become a mentor has been <strong style="color: #EF4444;">rejected</strong>.</p>
        ${rejection_reason ? `<div style="background: #FEF2F2; padding: 16px; border-radius: 8px; margin: 16px 0;"><p><strong>Reason:</strong> ${rejection_reason}</p></div>` : ''}
        <p>You may re-apply once you meet the requirements.</p>
      `}
      <hr />
      <p style="color: #6B7280; font-size: 12px;">This is an automated message from MENTIX-Hub. Please do not reply to this email.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"MENTIX-Hub" <${config.smtp.user}>`,
      to,
      subject,
      html
    });
    logger.info(`Promotion decision email sent: ${info.messageId}`, { to, status });
    return info;
  } catch (error) {
    logger.error('Promotion decision email failed', { error: error.message, to, status });
    throw error;
  }
}