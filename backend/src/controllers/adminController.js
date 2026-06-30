// src/controllers/adminController.js
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const KycSubmission = require('../models/KycSubmission');
const SupportTicket = require('../models/SupportTicket');
const BankAccount = require('../models/BankAccount');
const Session = require('../models/Session');
const Device = require('../models/Device');
const Notification = require('../models/Notification');
const { AppError } = require('../utils/errorHandler');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const securityActions = [
        'LOGIN',
        'LOGOUT',
        'PASSWORD_RESET',
        'PASSWORD_CHANGE',
        'DEVICE_ADDED',
        'DEVICE_REMOVED',
        '2FA_ENABLED',
        '2FA_DISABLED',
        'ADMIN_ACTION',
        'ACCOUNT_FROZEN',
        'ACCOUNT_UNFROZEN',
        'ACCOUNT_BANNED'
      ];

      const [
        userCount,
        activeUserCount,
        pendingKycCount,
        todaysTransactionCount,
        flaggedTxnCount,
        securityEventCount,
        openTicketCount,
        inProgressTicketCount,
        recentFraudAlerts,
        recentSecurityEvents,
        recentHighRiskTransactions,
        recentSupportTickets
      ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ accountStatus: 'ACTIVE' }),
        KycSubmission.countDocuments({ status: { $in: ['PENDING', 'UNDER_REVIEW', 'REUPLOAD_REQUESTED'] } }),
        Transaction.countDocuments({ createdAt: { $gte: startOfDay } }),
        Transaction.countDocuments({ isFlagged: true }),
        AuditLog.countDocuments({ action: { $in: securityActions } }),
        SupportTicket.countDocuments({ status: { $in: ['OPEN'] } }),
        SupportTicket.countDocuments({ status: 'IN_PROGRESS' }),
        Transaction.find({ isFlagged: true })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'firstName lastName email'),
        AuditLog.find({ action: { $in: securityActions } })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'firstName lastName email'),
        Transaction.find({ $or: [{ isFlagged: true }, { fraudScore: { $gte: 70 } }] })
          .sort({ fraudScore: -1, createdAt: -1 })
          .limit(5)
          .populate('userId', 'firstName lastName email'),
        SupportTicket.find({ status: { $in: ['OPEN', 'IN_PROGRESS'] } })
          .sort({ updatedAt: -1 })
          .limit(5)
          .populate('userId assignedTo', 'firstName lastName email role')
      ]);

      res.status(200).json({
        success: true,
        message: 'Admin dashboard data',
        data: {
          userCount,
          activeUserCount,
          pendingKycCount,
          todaysTransactionCount,
          flaggedTxnCount,
          securityEventCount,
          openTicketCount,
          inProgressTicketCount,
          recentFraudAlerts,
          recentSecurityEvents,
          recentHighRiskTransactions,
          recentSupportTickets
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const usersQuery = {};
      const [items, total] = await Promise.all([
        User.find(usersQuery)
          .select('firstName lastName email phone role accountStatus kycStatus twoFactorEnabled createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(usersQuery)
      ]);

      res.status(200).json({
        success: true,
        message: 'Users retrieved',
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

  async freezeUser(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await User.findByIdAndUpdate(
        id,
        { $set: { accountStatus: 'FROZEN' } },
        { new: true }
      );

      if (!updated) throw new AppError('User not found', 404);

      await AuditLog.create({
        userId: updated._id,
        action: 'ACCOUNT_FROZEN',
        resource: 'User',
        resourceId: id,
        changes: { accountStatus: updated.accountStatus },
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        severity: 'HIGH',
        metadata: { adminId: req.user.id }
      });

      res.status(200).json({
        success: true,
        message: 'User frozen successfully',
        data: { user: updated }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserDetails(req, res, next) {
    try {
      const { id } = req.params;
      const [user, bankAccounts, kyc, transactions, activityLogs, loginHistory, deviceHistory] = await Promise.all([
        User.findById(id).select('-password -passwordResetToken -passwordResetExpires -twoFactorSecret'),
        BankAccount.find({ userId: id }),
        KycSubmission.findOne({ userId: id }).sort({ createdAt: -1 }),
        Transaction.find({ userId: id }).sort({ createdAt: -1 }).limit(25),
        AuditLog.find({ userId: id }).sort({ createdAt: -1 }).limit(50),
        Session.find({ userId: id }).sort({ createdAt: -1 }).limit(25).select('-token -refreshToken'),
        Device.find({ userId: id }).sort({ lastUsedAt: -1 }).limit(25)
      ]);

      if (!user) throw new AppError('User not found', 404);

      const transactionCount = transactions.length;
      const flaggedCount = transactions.filter((transaction) => transaction.isFlagged).length;
      const avgFraudScore = transactionCount
        ? Math.round(transactions.reduce((sum, transaction) => sum + (transaction.fraudScore || 0), 0) / transactionCount)
        : 0;
      const statusRisk = ['FROZEN', 'BANNED', 'REJECTED'].includes(user.accountStatus) ? 30 : 0;
      const riskScore = Math.min(100, avgFraudScore + (flaggedCount * 10) + statusRisk);

      res.status(200).json({
        success: true,
        data: {
          user,
          bankAccounts: bankAccounts.map((account) => account.getMaskedAccount()),
          kyc,
          transactions,
          activityLogs,
          loginHistory,
          deviceHistory,
          riskScore
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async approveUser(req, res, next) {
    try {
      const updated = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { accountStatus: 'ACTIVE' } },
        { new: true }
      );
      if (!updated) throw new AppError('User not found', 404);
      await AuditLog.create({
        userId: updated._id,
        action: 'ADMIN_ACTION',
        resource: 'User',
        resourceId: req.params.id,
        changes: { accountStatus: 'ACTIVE' },
        metadata: { adminId: req.user.id }
      });
      res.status(200).json({ success: true, message: 'User approved', data: { user: updated } });
    } catch (error) {
      next(error);
    }
  }

  async rejectUser(req, res, next) {
    try {
      const updated = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { accountStatus: 'REJECTED' } },
        { new: true }
      );
      if (!updated) throw new AppError('User not found', 404);
      await AuditLog.create({
        userId: updated._id,
        action: 'ACCOUNT_REJECTED',
        resource: 'User',
        resourceId: req.params.id,
        changes: { reason: req.body.reason },
        metadata: { adminId: req.user.id }
      });
      res.status(200).json({ success: true, message: 'User rejected', data: { user: updated } });
    } catch (error) {
      next(error);
    }
  }

  async banUser(req, res, next) {
    try {
      const updated = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { accountStatus: 'BANNED' } },
        { new: true }
      );
      if (!updated) throw new AppError('User not found', 404);
      await AuditLog.create({
        userId: updated._id,
        action: 'ACCOUNT_BANNED',
        resource: 'User',
        resourceId: req.params.id,
        changes: { reason: req.body.reason },
        severity: 'HIGH',
        metadata: { adminId: req.user.id }
      });
      res.status(200).json({ success: true, message: 'User banned', data: { user: updated } });
    } catch (error) {
      next(error);
    }
  }

  async unfreezeUser(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await User.findByIdAndUpdate(
        id,
        { $set: { accountStatus: 'ACTIVE' } },
        { new: true }
      );

      if (!updated) throw new AppError('User not found', 404);

      await AuditLog.create({
        userId: updated._id,
        action: 'ACCOUNT_UNFROZEN',
        resource: 'User',
        resourceId: id,
        changes: { accountStatus: updated.accountStatus },
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        severity: 'MEDIUM',
        metadata: { adminId: req.user.id }
      });

      res.status(200).json({
        success: true,
        message: 'User unfrozen successfully',
        data: { user: updated }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const { isFlagged } = req.query;
      const filter = {};
      if (typeof isFlagged !== 'undefined') {
        filter.isFlagged = isFlagged === 'true';
      }

      const [items, total] = await Promise.all([
        Transaction.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'firstName lastName email'),
        Transaction.countDocuments(filter)
      ]);

      res.status(200).json({
        success: true,
        message: 'Transactions retrieved',
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

  async getFraudAlerts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        Transaction.find({ isFlagged: true })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'firstName lastName email accountStatus'),
        Transaction.countDocuments({ isFlagged: true })
      ]);

      res.status(200).json({
        success: true,
        message: 'Fraud alerts retrieved',
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

  async forceLogoutUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) throw new AppError('User not found', 404);

      await Session.updateMany(
        { userId: id, isActive: true },
        { $set: { isActive: false, logoutAt: new Date() } }
      );

      await AuditLog.create({
        userId: id,
        action: 'ADMIN_ACTION',
        resource: 'Session',
        resourceId: id,
        changes: { forceLogout: true },
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        severity: 'HIGH',
        metadata: { adminId: req.user.id }
      });

      res.status(200).json({ success: true, message: 'User sessions revoked' });
    } catch (error) {
      next(error);
    }
  }

  async resetUserPassword(req, res, next) {
    try {
      const { id } = req.params;
      const temporaryPassword = req.body.password || `SecurePay#${Math.floor(100000 + Math.random() * 900000)}`;
      const user = await User.findById(id).select('+password');
      if (!user) throw new AppError('User not found', 404);

      user.password = temporaryPassword;
      user.passwordChangedAt = new Date();
      await user.save();

      await Session.updateMany(
        { userId: id, isActive: true },
        { $set: { isActive: false, logoutAt: new Date() } }
      );

      await AuditLog.create({
        userId: id,
        action: 'PASSWORD_RESET',
        resource: 'User',
        resourceId: id,
        changes: { resetByAdmin: true },
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        severity: 'HIGH',
        metadata: { adminId: req.user.id }
      });

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
        data: { temporaryPassword: req.body.password ? undefined : temporaryPassword }
      });
    } catch (error) {
      next(error);
    }
  }

  async getKycQueue(req, res, next) {
    try {
      const statusList = ['PENDING', 'UNDER_REVIEW', 'REUPLOAD_REQUESTED'];
      const items = await KycSubmission.find({ status: { $in: statusList } })
        .populate('userId', 'firstName lastName email phone accountStatus')
        .sort({ createdAt: -1 });

      const meta = {
        totalMatching: items.length,
        countByStatus: statusList.reduce((acc, s) => {
          acc[s] = items.filter((i) => i.status === s).length;
          return acc;
        }, {})
      };

      // Debug: what the admin is about to receive
      console.log('[admin.getKycQueue] meta=', meta);
      if (items[0]) {
        console.log('[admin.getKycQueue] first item sample=', {
          _id: items[0]._id,
          status: items[0].status,
          userId: items[0].userId,
          panNumber: items[0].panNumber,
          aadhaarNumber: items[0].aadhaarNumber,
          address: items[0].address,
          dob: items[0].dob,
          documents: items[0].documents
        });
      }

      res.status(200).json({ success: true, data: { items, meta } });
    } catch (error) {
      next(error);
    }
  }



  async reviewKyc(req, res, next) {
    try {
      const status = req.body.status === 'APPROVED' ? 'APPROVED' : req.body.status === 'REUPLOAD_REQUESTED' ? 'REUPLOAD_REQUESTED' : 'REJECTED';

      if (status === 'REJECTED') {
        if (!req.body.reason) throw new AppError('Rejection reason is required', 400);
        if (!req.body.remarks) throw new AppError('Admin remarks are required', 400);
      }

      const submission = await KycSubmission.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            status,
            ...(status === 'REJECTED'
              ? { rejectionReason: req.body.reason, rejectionRemarks: req.body.remarks }
              : {}),
            reviewedBy: req.user.id,
            reviewedAt: new Date()
          }
        },
        { new: true }
      );

      if (!submission) throw new AppError('KYC submission not found', 404);

      if (status === 'APPROVED') {
        await User.findByIdAndUpdate(submission.userId, { $set: { kycStatus: 'LEVEL_2_VERIFIED', accountStatus: 'ACTIVE' } });
      } else if (status === 'REJECTED') {
        await User.findByIdAndUpdate(submission.userId, { $set: { kycStatus: 'REJECTED', accountStatus: 'REJECTED' } });
      }

      await AuditLog.create({
        userId: submission.userId,
        action: status === 'APPROVED' ? 'KYC_VERIFIED' : 'KYC_REJECTED',
        resource: 'KycSubmission',
        resourceId: submission._id.toString(),
        metadata: { adminId: req.user.id }
      });

      console.log('[admin.reviewKyc] id=', req.params.id, 'status=', status, 'payload=', { reason: req.body.reason, remarks: req.body.remarks });
      res.status(200).json({ success: true, data: { submission } });

    } catch (error) {
      next(error);
    }
  }

  async getTickets(req, res, next) {
    try {
      const { search, status, priority, assignedTo } = req.query;
      const filter = {};

      if (status && status !== 'ALL') filter.status = status;
      if (priority && priority !== 'ALL') filter.priority = priority;
      if (assignedTo && assignedTo !== 'ALL') {
        filter.assignedTo = assignedTo === 'UNASSIGNED' ? null : assignedTo;
      }
      if (search) {
        filter.$or = [
          { subject: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { 'messages.message': { $regex: search, $options: 'i' } }
        ];
      }

      const items = await SupportTicket.find(filter)
        .populate('userId', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email role')
        .sort({ updatedAt: -1 });
      res.status(200).json({ success: true, data: { items } });
    } catch (error) {
      next(error);
    }
  }

  async getTicketDetails(req, res, next) {
    try {
      const ticket = await SupportTicket.findById(req.params.id)
        .populate('userId', 'firstName lastName email phone')
        .populate('assignedTo', 'firstName lastName email role')
        .populate('messages.senderId', 'firstName lastName email role');
      if (!ticket) throw new AppError('Support ticket not found', 404);
      res.status(200).json({ success: true, data: { ticket } });
    } catch (error) {
      next(error);
    }
  }

  async replyTicket(req, res, next) {
    try {
      if (!req.body.message) throw new AppError('Reply message is required', 400);

      const ticket = await SupportTicket.findByIdAndUpdate(
        req.params.id,
        {
          $push: { messages: { senderId: req.user.id, senderRole: 'ADMIN', message: req.body.message } },
          $set: {
            status: req.body.status || 'IN_PROGRESS',
            assignedTo: req.body.assignToMe ? req.user.id : req.body.assignedTo || undefined
          }
        },
        { new: true }
      )
        .populate('userId', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email role');

      if (!ticket) throw new AppError('Support ticket not found', 404);

      await AuditLog.create({
        userId: ticket.userId?._id || ticket.userId,
        action: 'SUPPORT_TICKET_REPLIED',
        resource: 'SupportTicket',
        resourceId: ticket._id.toString(),
        metadata: { adminId: req.user.id },
        status: 'SUCCESS'
      });

      // Notify user of admin reply
      try {
        await Notification.create({
          userId: ticket.userId?._id || ticket.userId,
          type: 'ACCOUNT',
          title: 'New reply on your support ticket',
          message: `Support team replied to "${ticket.subject}"`,
          metadata: { ticketId: ticket._id.toString(), actionUrl: '/support-tickets' },
          status: 'SENT',
          priority: 'MEDIUM'
        });
      } catch (notifErr) {
        console.error('Failed to create notification for ticket reply:', notifErr);
      }

      res.status(200).json({ success: true, data: { ticket } });
    } catch (error) {
      next(error);
    }
  }

  async updateTicket(req, res, next) {
    try {
      const allowedStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
      const allowedPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      const updates = {};

      if (req.body.status) {
        if (!allowedStatuses.includes(req.body.status)) throw new AppError('Invalid ticket status', 400);
        updates.status = req.body.status;
        updates.closedAt = req.body.status === 'CLOSED' ? new Date() : undefined;
        updates.resolvedAt = req.body.status === 'RESOLVED' ? new Date() : undefined;
      }
      if (req.body.priority) {
        if (!allowedPriorities.includes(req.body.priority)) throw new AppError('Invalid ticket priority', 400);
        updates.priority = req.body.priority;
      }
      if (Object.prototype.hasOwnProperty.call(req.body, 'assignedTo')) {
        updates.assignedTo = req.body.assignedTo || null;
      }

      const ticket = await SupportTicket.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      )
        .populate('userId', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email role');

      if (!ticket) throw new AppError('Support ticket not found', 404);

      await AuditLog.create({
        userId: ticket.userId?._id || ticket.userId,
        action: 'SUPPORT_TICKET_UPDATED',
        resource: 'SupportTicket',
        resourceId: ticket._id.toString(),
        changes: updates,
        metadata: { adminId: req.user.id },
        status: 'SUCCESS'
      });

      // Notify user of status/priority change
      try {
        const statusLabels = { OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };
        if (updates.status) {
          await Notification.create({
            userId: ticket.userId?._id || ticket.userId,
            type: 'ACCOUNT',
            title: 'Support ticket status changed',
            message: `"${ticket.subject}" is now ${statusLabels[updates.status] || updates.status}`,
            metadata: { ticketId: ticket._id.toString(), actionUrl: '/support-tickets' },
            status: 'SENT',
            priority: 'MEDIUM'
          });
        }
        if (updates.priority) {
          await Notification.create({
            userId: ticket.userId?._id || ticket.userId,
            type: 'ACCOUNT',
            title: 'Support ticket priority changed',
            message: `"${ticket.subject}" priority changed to ${updates.priority}`,
            metadata: { ticketId: ticket._id.toString(), actionUrl: '/support-tickets' },
            status: 'SENT',
            priority: 'LOW'
          });
        }
      } catch (notifErr) {
        console.error('Failed to create notification for ticket update:', notifErr);
      }

      res.status(200).json({ success: true, data: { ticket } });
    } catch (error) {
      next(error);
    }
  }

  async assignTicket(req, res, next) {
    try {
      const assignedTo = req.body.assignedTo || req.user.id;
      const assignee = await User.findOne({ _id: assignedTo, role: { $in: ['ADMIN', 'ANALYST', 'KYC_OFFICER'] } });
      if (!assignee) throw new AppError('Assigned admin not found', 404);

      const ticket = await SupportTicket.findByIdAndUpdate(
        req.params.id,
        { $set: { assignedTo, status: 'IN_PROGRESS' } },
        { new: true }
      )
        .populate('userId', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email role');

      if (!ticket) throw new AppError('Support ticket not found', 404);

      await AuditLog.create({
        userId: ticket.userId?._id || ticket.userId,
        action: 'SUPPORT_TICKET_UPDATED',
        resource: 'SupportTicket',
        resourceId: ticket._id.toString(),
        changes: { assignedTo, status: 'IN_PROGRESS' },
        metadata: { adminId: req.user.id },
        status: 'SUCCESS'
      });

      // Notify user of assignment
      try {
        await Notification.create({
          userId: ticket.userId?._id || ticket.userId,
          type: 'ACCOUNT',
          title: 'Support ticket assigned',
          message: `Your ticket "${ticket.subject}" has been assigned to ${assignee.firstName} ${assignee.lastName}`,
          metadata: { ticketId: ticket._id.toString(), actionUrl: '/support-tickets' },
          status: 'SENT',
          priority: 'MEDIUM'
        });
      } catch (notifErr) {
        console.error('Failed to create notification for ticket assignment:', notifErr);
      }

      res.status(200).json({ success: true, data: { ticket } });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const items = await AuditLog.find({}).populate('userId', 'firstName lastName email').sort({ createdAt: -1 }).limit(200);
      res.status(200).json({ success: true, data: { items } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
