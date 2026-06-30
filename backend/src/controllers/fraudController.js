// src/controllers/fraudController.js
const axios = require('axios');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const { AppError } = require('../utils/errorHandler');

class FraudController {
  // Body: { transactionId, features: {...} }
  async analyze(req, res, next) {
    try {
      const { transactionId, features = {} } = req.body;
      if (!transactionId) throw new AppError('transactionId is required', 400);

      const transaction = await Transaction.findOne({ transactionId });
      if (!transaction) throw new AppError('Transaction not found', 404);

      // Call AI service
      const aiBaseUrl = process.env.FRAUD_AI_BASE_URL || 'http://localhost:5001';
      const { data } = await axios.post(`${aiBaseUrl}/predict`, {
        transaction: {
          id: transaction.transactionId,
          amount: transaction.amount,
          type: transaction.type,
          deviceFingerprint: transaction.deviceFingerprint,
          ipAddress: transaction.ipAddress,
          ...features
        }
      });

      const { riskScore, reasons } = data || {};
      const score = typeof riskScore === 'number' ? riskScore : 0;

      transaction.fraudScore = score;
      const flagged = score >= (parseInt(process.env.FRAUD_FLAG_THRESHOLD || 70));
      transaction.isFlagged = flagged;
      transaction.fraudReason = Array.isArray(reasons) ? reasons.join('; ') : (reasons || '');

      await transaction.save();

      if (flagged) {
        await AuditLog.create({
          userId: transaction.userId,
          action: 'ADMIN_ACTION',
          resource: 'FRAUD_ANALYSIS',
          resourceId: transaction._id.toString(),
          changes: { riskScore: score },
          status: 'SUCCESS',
          severity: 'CRITICAL',
          metadata: { flaggedByAI: true }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Fraud analysis completed',
        data: {
          transaction: {
            transactionId: transaction.transactionId,
            fraudScore: transaction.fraudScore,
            isFlagged: transaction.isFlagged,
            fraudReason: transaction.fraudReason
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async history(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const filter = {};
      if (typeof req.query.isFlagged !== 'undefined') {
        filter.isFlagged = req.query.isFlagged === 'true';
      }

      const [items, total] = await Promise.all([
        Transaction.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Transaction.countDocuments(filter)
      ]);

      res.status(200).json({
        success: true,
        message: 'Fraud history retrieved',
        data: {
          items,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FraudController();

