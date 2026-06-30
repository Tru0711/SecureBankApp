// src/controllers/walletController.js
const WalletService = require('../services/walletService');
const { AppError } = require('../utils/errorHandler');
const { verifyTransactionPin } = require('../utils/transactionPin');

class WalletController {
  // Get Wallet
  async getWallet(req, res, next) {
    try {
      const wallet = await WalletService.getWallet(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Wallet retrieved',
        data: { wallet }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create Wallet
  async createWallet(req, res, next) {
    try {
      const wallet = await WalletService.createWallet(req.user.id);

      res.status(201).json({
        success: true,
        message: 'Wallet created successfully',
        data: { wallet }
      });
    } catch (error) {
      next(error);
    }
  }

  // Add Money
  async addMoney(req, res, next) {
    try {
      // Phase 2: enforce onboarding requirements at controller level too (backend security).
      const user = req.user;
      if (!user || user.accountStatus !== 'ACTIVE') {
        return next(new (require('../utils/errorHandler').AppError)('KYC and bank verification required', 403));
      }

      const { amount, paymentMethodId, razorpayPaymentId, transactionPin } = req.body;


      if (!amount) {
        throw new AppError('Amount is required', 400);
      }

      if (amount <= 0) {
        throw new AppError('Amount must be greater than 0', 400);
      }

      await verifyTransactionPin(req.user.id, transactionPin, {
        operation: 'WALLET_ADD_MONEY',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        deviceFingerprint: req.body?.deviceFingerprint
      });

      const result = await WalletService.addMoney(
        req.user.id,
        amount,
        paymentMethodId,
        razorpayPaymentId
      );

      res.status(200).json({
        success: true,
        message: 'Money added successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Transfer Money
  async transferMoney(req, res, next) {
    try {
      // Phase 2: enforce onboarding requirements at controller level too (backend security).
      const user = req.user;
      if (!user || user.accountStatus !== 'ACTIVE') {
        return next(new (require('../utils/errorHandler').AppError)('KYC and bank verification required', 403));
      }

      const { receiverEmail, amount, description, transactionPin } = req.body;


      if (!receiverEmail || !amount) {
        throw new AppError('Receiver email and amount are required', 400);
      }

      if (amount <= 0) {
        throw new AppError('Amount must be greater than 0', 400);
      }

      await verifyTransactionPin(req.user.id, transactionPin, {
        operation: 'WALLET_TRANSFER',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        deviceFingerprint: req.body?.deviceFingerprint
      });

      const deviceData = {
        fingerprint: req.body.deviceFingerprint || 'UNKNOWN',
        userAgent: req.get('user-agent'),
        ipAddress: req.ip
      };

      const result = await WalletService.transferMoney(
        req.user.id,
        receiverEmail,
        amount,
        description,
        deviceData
      );

      res.status(200).json({
        success: true,
        message: 'Transfer successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Transaction History
  async getTransactionHistory(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filter = {};

      if (req.query.type) {
        filter.type = req.query.type;
      }

      if (req.query.status) {
        filter.status = req.query.status;
      }

      const result = await WalletService.getTransactionHistory(
        req.user.id,
        page,
        limit,
        filter
      );

      res.status(200).json({
        success: true,
        message: 'Transactions retrieved',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Transaction Details
  async getTransactionDetails(req, res, next) {
    try {
      const { transactionId } = req.params;

      const transaction = await WalletService.getTransactionDetails(transactionId, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Transaction details retrieved',
        data: { transaction }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Balance
  async getBalance(req, res, next) {
    try {
      const balance = await WalletService.getBalance(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Balance retrieved',
        data: { balance }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
