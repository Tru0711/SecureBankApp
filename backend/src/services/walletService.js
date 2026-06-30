// src/services/walletService.js
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { AppError } = require('../utils/errorHandler');
const { generateTransactionId } = require('../utils/helpers');

class WalletService {
  // Get Wallet
  async getWallet(userId) {
    try {
      const wallet = await Wallet.findOne({ userId }).populate('userId', 'firstName lastName email');
      
      if (!wallet) {
        throw new AppError('Wallet not found', 404);
      }

      return wallet;
    } catch (error) {
      throw error;
    }
  }

  // Create Wallet
  async createWallet(userId) {
    try {
      const existingWallet = await Wallet.findOne({ userId });

      if (existingWallet) {
        throw new AppError('Wallet already exists', 409);
      }

      const wallet = await Wallet.create({
        userId,
        balance: 0
      });

      await AuditLog.create({
        userId,
        action: 'WALLET_CREATED',
        resourceId: wallet._id,
        status: 'SUCCESS'
      });

      return wallet;
    } catch (error) {
      throw error;
    }
  }

  // Add Money to Wallet
  async addMoney(userId, amount, paymentMethodId, razorpayPaymentId = null) {
    try {
      const wallet = await Wallet.findOne({ userId });

      if (!wallet) {
        throw new AppError('Wallet not found', 404);
      }

      // Create transaction
      const transaction = await Transaction.create({
        transactionId: generateTransactionId(),
        userId,
        type: 'DEPOSIT',
        amount,
        paymentMethod: 'RAZORPAY',
        razorpayPaymentId,
        status: 'SUCCESS',
        receiver: {
          userId,
          firstName: (await User.findById(userId)).firstName
        }
      });

      // Update wallet balance
      wallet.balance += amount;
      wallet.totalIncome += amount;
      wallet.isVerified = true;
      wallet.verificationDate = new Date();
      await wallet.save();

      // Log action
      await AuditLog.create({
        userId,
        action: 'MONEY_ADDED',
        resourceId: transaction._id,
        changes: { amount, transactionId: transaction.transactionId },
        status: 'SUCCESS'
      });

      return {
        wallet,
        transaction
      };
    } catch (error) {
      throw error;
    }
  }

  // Transfer Money
  async transferMoney(senderId, receiverEmail, amount, description, deviceData) {
    try {
      // Validate amount
      if (amount < parseInt(process.env.MIN_TRANSACTION_AMOUNT || 1)) {
        throw new AppError('Amount is below minimum transaction limit', 400);
      }

      if (amount > parseInt(process.env.SINGLE_TRANSACTION_LIMIT || 50000)) {
        throw new AppError('Amount exceeds maximum transaction limit', 400);
      }

      // Get sender wallet
      const senderWallet = await Wallet.findOne({ userId: senderId });

      if (!senderWallet) {
        throw new AppError('Sender wallet not found', 404);
      }

      if (senderWallet.balance < amount) {
        throw new AppError('Insufficient balance', 400);
      }

      // Get receiver user
      const receiver = await User.findOne({ email: receiverEmail });

      if (!receiver) {
        throw new AppError('Receiver not found', 404);
      }

      if (senderId.toString() === receiver._id.toString()) {
        throw new AppError('Cannot transfer to yourself', 400);
      }

      // Get receiver wallet
      const receiverWallet = await Wallet.findOne({ userId: receiver._id });

      if (!receiverWallet) {
        throw new AppError('Receiver wallet not found', 404);
      }

      // Check daily transfer limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dailyTransfers = await Transaction.aggregate([
        {
          $match: {
            userId: senderId,
            type: 'TRANSFER',
            status: 'SUCCESS',
            createdAt: { $gte: today }
          }
        },
        {
          $group: { _id: null, total: { $sum: '$amount' } }
        }
      ]);

      const dailySpent = dailyTransfers.length > 0 ? dailyTransfers[0].total : 0;

      if (dailySpent + amount > parseInt(process.env.DAILY_TRANSFER_LIMIT || 100000)) {
        throw new AppError('Daily transfer limit exceeded', 400);
      }

      // Create transfer transaction
      const transactionId = generateTransactionId();
      const transaction = await Transaction.create({
        transactionId,
        userId: senderId,
        type: 'TRANSFER',
        amount,
        description,
        paymentMethod: 'WALLET',
        status: 'SUCCESS',
        sender: {
          userId: senderId,
          firstName: (await User.findById(senderId)).firstName
        },
        receiver: {
          userId: receiver._id,
          firstName: receiver.firstName,
          email: receiver.email
        },
        deviceFingerprint: deviceData.fingerprint,
        ipAddress: deviceData.ipAddress
      });

      // Update sender wallet
      senderWallet.balance -= amount;
      senderWallet.dailySpent += amount;
      senderWallet.totalExpense += amount;
      senderWallet.totalTransfers += 1;
      await senderWallet.save();

      // Update receiver wallet
      receiverWallet.balance += amount;
      receiverWallet.totalIncome += amount;
      await receiverWallet.save();

      // Create credit transaction for receiver
      await Transaction.create({
        transactionId: `${transactionId}-CREDIT`,
        userId: receiver._id,
        type: 'CREDIT',
        amount,
        description: `Received from ${(await User.findById(senderId)).firstName}`,
        paymentMethod: 'WALLET',
        status: 'SUCCESS',
        sender: {
          userId: senderId
        },
        receiver: {
          userId: receiver._id,
          firstName: receiver.firstName
        }
      });

      // Log action
      await AuditLog.create({
        userId: senderId,
        action: 'MONEY_TRANSFERRED',
        resourceId: transaction._id,
        changes: { amount, receiver: receiver.email, transactionId },
        status: 'SUCCESS'
      });

      return {
        transaction,
        senderWallet,
        receiverWallet
      };
    } catch (error) {
      throw error;
    }
  }

  // Get Transaction History
  async getTransactionHistory(userId, page = 1, limit = 10, filter = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = { userId, ...filter };

      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email');

      const total = await Transaction.countDocuments(query);
      const pages = Math.ceil(total / limit);

      return {
        transactions,
        pagination: {
          total,
          page,
          pages,
          limit
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get Transaction Details
  async getTransactionDetails(transactionId, userId) {
    try {
      console.log('[txn details] received transactionId=', transactionId);
      console.log('[txn details] authenticated userId=', userId);
      const transaction = await Transaction.findById(transactionId)
        .populate('userId', 'firstName lastName email');
      console.log('[txn details] findById result is null?', !transaction);

      if (!transaction) {
        throw new AppError(`Transaction not found for id=${transactionId}`, 404);
      }

      // Check authorization
      const ownerMismatch = transaction.userId?.toString() !== userId?.toString();
      console.log('[txn details] ownership mismatch?', ownerMismatch, {
        transactionUserId: transaction.userId?.toString(),
        authUserId: userId?.toString()
      });

      // If transaction belongs to another user, treat as not found/unauthorized
      if (ownerMismatch) {
        throw new AppError('Unauthorized access', 403);
      }

      return transaction;

    } catch (error) {
      throw error;
    }
  }

  // Get Wallet Balance
  async getBalance(userId) {
    try {
      const wallet = await Wallet.findOne({ userId });

      if (!wallet) {
        throw new AppError('Wallet not found', 404);
      }

      return {
        balance: wallet.balance,
        lockedAmount: wallet.lockedAmount,
        availableBalance: wallet.availableBalance,
        currency: wallet.currency
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new WalletService();
