// src/services/notificationService.js
const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const { AppError } = require('../utils/errorHandler');
const { generateOTP } = require('../utils/helpers');

// Configure email transporter
// NOTE: many SMTP providers use:
// - 465 with secure=true (SMTPS)
// - 587 with secure=false + STARTTLS
const smtpPort = Number(process.env.SMTP_PORT || 0);
if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SMTP_FROM) {
  console.warn('SMTP env vars are not fully set. Check SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD/SMTP_FROM');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  requireTLS: smtpPort !== 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

class NotificationService {
  // Send verification email
  async sendVerificationEmail(user) {
    try {
      const otp = generateOTP();

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .otp-box { background-color: #007bff; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to SecurePay NeoBank</h1>
            </div>
            <div class="content">
              <h2>Email Verification</h2>
              <p>Dear ${user.firstName},</p>
              <p>Thank you for registering with SecurePay NeoBank. Please verify your email using the OTP below:</p>
              <div class="otp-box">${otp}</div>
              <p>This OTP is valid for 10 minutes. Do not share this OTP with anyone.</p>
              <p>If you did not register, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 SecurePay NeoBank. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'Email Verification - SecurePay NeoBank',
        html: htmlContent
      });

      // Create notification record
      await Notification.create({
        userId: user._id,
        type: 'ACCOUNT',
        title: 'Email Verification',
        message: `OTP: ${otp}`,
        channel: ['EMAIL'],
        status: 'SENT'
      });

      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      console.error('sendVerificationEmail error:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        response: error?.response
      });
      throw new AppError('Failed to send verification email', 500);
    }
  }

  // Send OTP email
  async sendOTPEmail(user, otp) {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .otp-box { background-color: #28a745; color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; margin: 20px 0; letter-spacing: 2px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your OTP Code</h1>
            </div>
            <div class="content">
              <p>Dear ${user.firstName},</p>
              <p>Your OTP code is:</p>
              <div class="otp-box">${otp}</div>
              <p>This code is valid for 10 minutes. Do not share this code with anyone.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'Your OTP Code - SecurePay NeoBank',
        html: htmlContent
      });

      return { success: true };
    } catch (error) {
      throw new AppError('Failed to send OTP email', 500);
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { background-color: #dc3545; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Dear ${user.firstName},</p>
              <p>You requested to reset your password. Click the button below to reset it:</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'Password Reset Request - SecurePay NeoBank',
        html: htmlContent
      });

      return { success: true };
    } catch (error) {
      throw new AppError('Failed to send password reset email', 500);
    }
  }

  // Send transaction notification
  async sendTransactionNotification(userId, transaction) {
    try {
      const user = await require('../models/User').findById(userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      let subject, message;

      if (transaction.type === 'DEPOSIT') {
        subject = 'Money Added Successfully';
        message = `Your wallet has been credited with ₹${transaction.amount / 100}. Transaction ID: ${transaction.transactionId}`;
      } else if (transaction.type === 'TRANSFER') {
        subject = 'Money Transferred Successfully';
        message = `₹${transaction.amount / 100} transferred to ${transaction.receiver.firstName}. Transaction ID: ${transaction.transactionId}`;
      } else if (transaction.type === 'CREDIT') {
        subject = 'Money Received';
        message = `You received ₹${transaction.amount / 100} from ${transaction.sender.firstName}. Transaction ID: ${transaction.transactionId}`;
      }

      // Create in-app notification
      await Notification.create({
        userId,
        type: 'TRANSACTION',
        title: subject,
        message,
        transactionId: transaction._id,
        channel: user.notificationPreferences.emailNotifications ? ['EMAIL', 'IN_APP'] : ['IN_APP']
      });

      // Send email if enabled
      if (user.notificationPreferences.emailNotifications) {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <body>
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>${subject}</h2>
              <p>${message}</p>
              <p>Time: ${new Date().toLocaleString()}</p>
            </div>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: user.email,
          subject: `${subject} - SecurePay NeoBank`,
          html: htmlContent
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to send transaction notification:', error);
      // Don't throw error to prevent transaction failure
      return { success: false };
    }
  }

  // Send fraud alert
  async sendFraudAlert(userId, transaction) {
    try {
      const user = await require('../models/User').findById(userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .warning { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="warning">
              <h2>⚠️ Security Alert</h2>
              <p>A suspicious transaction has been detected on your account:</p>
              <p>
                <strong>Amount:</strong> ₹${transaction.amount / 100}<br>
                <strong>Timestamp:</strong> ${new Date().toLocaleString()}<br>
                <strong>Fraud Score:</strong> ${transaction.fraudScore}%
              </p>
              <p>If this was not you, please contact us immediately.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create notification
      await Notification.create({
        userId,
        type: 'FRAUD_ALERT',
        title: 'Suspicious Activity Detected',
        message: `A suspicious transaction of ₹${transaction.amount / 100} has been detected`,
        transactionId: transaction._id,
        priority: 'URGENT',
        channel: ['EMAIL', 'IN_APP'],
        status: 'SENT'
      });

      // Send email
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: '⚠️ Security Alert - SecurePay NeoBank',
        html: htmlContent
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to send fraud alert:', error);
      return { success: false };
    }
  }
}

module.exports = new NotificationService();
