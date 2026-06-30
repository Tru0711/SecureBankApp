// src/services/razorpayService.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const WalletService = require('./walletService');
const NotificationService = require('./notificationService');
const { AppError } = require('../utils/errorHandler');
const { generateOrderId } = require('../utils/helpers');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

class RazorpayService {
  // Create Order
  async createOrder(userId, amount, description = 'Wallet Top-up') {
    try {
      const orderId = generateOrderId();

      const order = await razorpay.orders.create({
        amount: amount, // Amount in paise
        currency: 'INR',
        receipt: orderId,
        description,
        notes: {
          userId,
          transactionType: 'WALLET_TOPUP'
        }
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      };
    } catch (error) {
      throw new AppError('Failed to create Razorpay order', 500);
    }
  }

  // Verify Payment
  async verifyPayment(orderId, paymentId, signature) {
    try {
      // Verify signature
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new AppError('Invalid payment signature', 400);
      }

      // Fetch payment details
      const payment = await razorpay.payments.fetch(paymentId);

      if (payment.status !== 'captured') {
        throw new AppError('Payment not captured', 400);
      }

      return payment;
    } catch (error) {
      throw error;
    }
  }

  // Handle Webhook
  async handleWebhook(event) {
    try {
      switch (event.event) {
        case 'payment.authorized':
          await this.handlePaymentAuthorized(event.payload.payment.entity);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(event.payload.payment.entity);
          break;

        case 'payment.captured':
          await this.handlePaymentCaptured(event.payload.payment.entity);
          break;

        default:
          console.log('Unhandled webhook event:', event.event);
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  // Handle Payment Authorized
  async handlePaymentAuthorized(payment) {
    try {
      const userId = payment.notes.userId;
      const amount = payment.amount;

      // Update transaction status
      await Transaction.findOneAndUpdate(
        { razorpayPaymentId: payment.id },
        { status: 'PENDING' },
        { new: true }
      );

      return { success: true };
    } catch (error) {
      console.error('Payment authorized handler error:', error);
    }
  }

  // Handle Payment Failed
  async handlePaymentFailed(payment) {
    try {
      const userId = payment.notes.userId;

      // Update transaction status
      const transaction = await Transaction.findOneAndUpdate(
        { razorpayPaymentId: payment.id },
        { status: 'FAILED' },
        { new: true }
      );

      // Send notification
      await NotificationService.sendTransactionNotification(userId, transaction);

      return { success: true };
    } catch (error) {
      console.error('Payment failed handler error:', error);
    }
  }

  // Handle Payment Captured
  async handlePaymentCaptured(payment) {
    try {
      const userId = payment.notes.userId;
      const amount = payment.amount;

      // Find existing transaction or create new one
      let transaction = await Transaction.findOne({
        razorpayPaymentId: payment.id
      });

      if (!transaction) {
        transaction = await Transaction.create({
          userId,
          type: 'DEPOSIT',
          amount,
          paymentMethod: 'RAZORPAY',
          razorpayPaymentId: payment.id,
          status: 'SUCCESS',
          receiver: { userId }
        });
      } else {
        transaction.status = 'SUCCESS';
        await transaction.save();
      }

      // Add money to wallet
      await WalletService.addMoney(userId, amount, null, payment.id);

      // Send notification
      await NotificationService.sendTransactionNotification(userId, transaction);

      return { success: true };
    } catch (error) {
      console.error('Payment captured handler error:', error);
    }
  }

  // Refund Payment
  async refundPayment(paymentId, amount = null) {
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount
      });

      return refund;
    } catch (error) {
      throw new AppError('Failed to process refund', 500);
    }
  }
}

module.exports = new RazorpayService();
