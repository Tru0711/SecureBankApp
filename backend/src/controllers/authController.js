const AuthService = require('../services/authService');
const { AppError } = require('../utils/errorHandler');
const { validateEmail, validatePassword, validatePhone } = require('../utils/validators');

class AuthController {

  async register(req, res, next) {
    try {
      const { firstName, lastName, email, phone, password, confirmPassword, dateOfBirth } = req.body;

      
      if (!firstName || !lastName || !email || !phone || !password || !confirmPassword || !dateOfBirth) {
        throw new AppError('All fields are required', 400);
      }

      if (!validateEmail(email)) {
        throw new AppError('Invalid email format', 400);
      }

      if (!validatePhone(phone)) {
        throw new AppError('Invalid phone number', 400);
      }

      if (!validatePassword(password)) {
        throw new AppError('Password must be at least 8 characters with uppercase, lowercase, number and special character', 400);
      }

      if (password !== confirmPassword) {
        throw new AppError('Passwords do not match', 400);
      }

      const user = await AuthService.registerUser({
        firstName,
        lastName,
        email,
        phone,
        password,
        dateOfBirth,
        ipAddress: req.ip
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;


      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      if (!validateEmail(email)) {
        throw new AppError('Invalid email format', 400);
      }

      // Get device data from request
      const deviceData = {
        fingerprint: req.body.deviceFingerprint || 'UNKNOWN',
        userAgent: req.get('user-agent'),
        ipAddress: req.ip
      };

      const result = await AuthService.loginUser(email, password, deviceData);

      // Set refresh token in secure cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          expiresIn: result.expiresIn
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh Token
  async refreshToken(req, res, next) {
    try {
      const cookies = Object.fromEntries(
        (req.headers.cookie || '')
          .split(';')
          .map((part) => part.trim().split('='))
          .filter(([key, value]) => key && value)
          .map(([key, value]) => [key, decodeURIComponent(value)])
      );
      const refreshToken = req.body.refreshToken || cookies.refreshToken;

      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
      }

      const result = await AuthService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed',
        data: {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout
  async logout(req, res, next) {
    try {
      const userId = req.user.id;
      const token = req.headers.authorization?.split(' ')[1];

      await AuthService.logoutUser(userId, token);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Request Password Reset
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError('Email is required', 400);
      }

      if (!validateEmail(email)) {
        throw new AppError('Invalid email format', 400);
      }

      await AuthService.requestPasswordReset(email);

      res.status(200).json({
        success: true,
        message: 'Password reset link sent to email'
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset Password
  async resetPassword(req, res, next) {
    try {
      const { resetToken, password, confirmPassword } = req.body;

      if (!resetToken || !password || !confirmPassword) {
        throw new AppError('All fields are required', 400);
      }

      if (!validatePassword(password)) {
        throw new AppError('Password must be at least 8 characters with uppercase, lowercase, number and special character', 400);
      }

      if (password !== confirmPassword) {
        throw new AppError('Passwords do not match', 400);
      }

      await AuthService.resetPassword(resetToken, password);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify Email
  async verifyEmail(req, res, next) {
    try {
      const { otp } = req.body;
      const userId = req.user.id;

      if (!otp) {
        throw new AppError('OTP is required', 400);
      }

      await AuthService.verifyEmail(userId, otp);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Send OTP
  async sendOTP(req, res, next) {
    try {
      const { email, type = 'EMAIL_VERIFICATION' } = req.body;

      if (!email) {
        throw new AppError('Email is required', 400);
      }

      if (!validateEmail(email)) {
        throw new AppError('Invalid email format', 400);
      }

      await AuthService.sendOTP(email, type);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async resendOTP(req, res, next) {
    try {
      const { email, type = 'EMAIL_VERIFICATION' } = req.body;

      if (!email) {
        throw new AppError('Email is required', 400);
      }

      if (!validateEmail(email)) {
        throw new AppError('Invalid email format', 400);
      }

      await AuthService.sendOTP(email, type, true);

      res.status(200).json({
        success: true,
        message: 'OTP resent successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req, res, next) {
    try {
      const { email, otp, type = 'EMAIL_VERIFICATION' } = req.body;

      if (!email || !otp) {
        throw new AppError('Email and OTP are required', 400);
      }

      if (!validateEmail(email)) {
        throw new AppError('Invalid email format', 400);
      }

      const result = await AuthService.verifyOtp(email, otp, type);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { user: result.user }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
