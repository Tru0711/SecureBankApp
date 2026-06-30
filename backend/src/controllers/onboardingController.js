const User = require('../models/User');
const BankAccount = require('../models/BankAccount');
const KycSubmission = require('../models/KycSubmission');
const Beneficiary = require('../models/Beneficiary');
const MoneyRequest = require('../models/MoneyRequest');
const SupportTicket = require('../models/SupportTicket');
const Nominee = require('../models/Nominee');
const EmergencyContact = require('../models/EmergencyContact');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { AppError } = require('../utils/errorHandler');
const { STATUSES } = require('../utils/userStatus');

const logAction = (req, action, changes = {}) => AuditLog.create({
  userId: req.user.id,
  action,
  changes,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  status: 'SUCCESS'
});

class OnboardingController {
  async completeProfile(req, res, next) {
    try {
      const allowed = [
        'firstName', 'lastName', 'dateOfBirth', 'gender', 'phone', 'occupation',
        'annualIncome', 'panNumber', 'aadhaarNumber', 'address'
      ];
      const updates = {};
      allowed.forEach((field) => {
        if (typeof req.body[field] !== 'undefined') updates[field] = req.body[field];
      });
      updates.profileCompletedAt = new Date();
      updates.accountStatus = STATUSES.BANK_DETAILS_PENDING;

      const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true });
      await logAction(req, 'PROFILE_UPDATED', updates);

      res.status(200).json({ success: true, message: 'Profile completed', data: { user: user.getPublicProfile() } });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      res.status(200).json({ success: true, data: { user: user.getPublicProfile() } });
    } catch (error) {
      next(error);
    }
  }

  async getOnboardingStatus(req, res, next) {
    try {
      const [user, bankAccounts, kyc] = await Promise.all([
        User.findById(req.user.id),
        BankAccount.find({ userId: req.user.id }).sort({ isPrimary: -1, createdAt: -1 }),
        KycSubmission.findOne({ userId: req.user.id }).sort({ createdAt: -1 })
      ]);

      res.status(200).json({
        success: true,
        data: {
          accountStatus: user.accountStatus,
          profile: {
            status: user.profileCompletedAt ? 'COMPLETED' : 'PENDING',
            completedAt: user.profileCompletedAt
          },
          bank: {
            status: bankAccounts.length > 0 ? 'COMPLETED' : 'PENDING',
            count: bankAccounts.length,
            primary: bankAccounts.find((account) => account.isPrimary)?.getMaskedAccount() || null
          },
          kyc: {
            status: kyc?.status || 'PENDING',
            rejectionReason: kyc?.rejectionReason || null,
            submittedAt: kyc?.createdAt || null,
            reviewedAt: kyc?.reviewedAt || null
          },
          approval: {
            status: user.accountStatus === STATUSES.ACTIVE ? 'APPROVED' : user.accountStatus,
            isActive: user.accountStatus === STATUSES.ACTIVE
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getKyc(req, res, next) {
    try {
      const submission = await KycSubmission.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: { submission } });
    } catch (error) {
      next(error);
    }
  }

  async listBankAccounts(req, res, next) {
    try {
      const accounts = await BankAccount.find({ userId: req.user.id }).sort({ isPrimary: -1, createdAt: -1 });
      res.status(200).json({ success: true, data: { items: accounts.map((account) => account.getMaskedAccount()) } });
    } catch (error) {
      next(error);
    }
  }

  async addBankAccount(req, res, next) {
    try {
      const { transactionPin } = req.body;
      const { verifyTransactionPin } = require('../utils/transactionPin');
      await verifyTransactionPin(req.user.id, transactionPin, {
        operation: 'BANK_ADD',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        deviceFingerprint: req.body?.deviceFingerprint
      });

      const { bankName, accountHolderName, accountNumber, confirmAccountNumber, ifsc, branch, accountType, isPrimary } = req.body;

      if (!bankName || !accountHolderName || !accountNumber || !confirmAccountNumber || !ifsc) {
        throw new AppError('Bank name, holder name, account number and IFSC are required', 400);
      }
      if (accountNumber !== confirmAccountNumber) {
        throw new AppError('Account numbers do not match', 400);
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(ifsc).toUpperCase())) {
        throw new AppError('Invalid IFSC code', 400);
      }
      const existingCount = await BankAccount.countDocuments({ userId: req.user.id });
      const shouldBePrimary = Boolean(isPrimary) || existingCount === 0;
      if (shouldBePrimary) {
        await BankAccount.updateMany({ userId: req.user.id }, { $set: { isPrimary: false } });
      }
      const account = await BankAccount.create({
        userId: req.user.id,
        bankName,
        accountHolderName,
        accountNumber,
        accountNumberLast4: accountNumber.slice(-4),
        ifsc,
        branch,
        accountType,
        isPrimary: shouldBePrimary
      });

      await User.findByIdAndUpdate(req.user.id, { $set: { accountStatus: STATUSES.KYC_PENDING } });
      await logAction(req, 'BANK_ADDED', {
        operation: 'BANK_ADD',
        after: account.getMaskedAccount()
      });


      res.status(201).json({ success: true, message: 'Bank account added', data: { account: account.getMaskedAccount() } });
    } catch (error) {
      next(error);
    }
  }

  async updateBankAccount(req, res, next) {
    try {
      const { id } = req.params;
      const { transactionPin } = req.body;
      const updates = { ...req.body };
      delete updates.accountNumber;
      delete updates.confirmAccountNumber;
      delete updates.transactionPin;

      const { verifyTransactionPin } = require('../utils/transactionPin');
      await verifyTransactionPin(req.user.id, transactionPin, {
        operation: updates?.isPrimary ? 'BANK_SET_DEFAULT' : 'BANK_UPDATE',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        deviceFingerprint: req.body?.deviceFingerprint
      });

      if (updates.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(updates.ifsc).toUpperCase())) {
        throw new AppError('Invalid IFSC code', 400);
      }
      if (updates.isPrimary) {
        await BankAccount.updateMany({ userId: req.user.id }, { $set: { isPrimary: false } });
      }

      const before = await BankAccount.findOne({ _id: id, userId: req.user.id }).lean();

      const account = await BankAccount.findOneAndUpdate({ _id: id, userId: req.user.id }, { $set: updates }, { new: true });
      if (!account) throw new AppError('Bank account not found', 404);

      await logAction(req, updates.isPrimary ? 'BANK_DEFAULT_CHANGED' : 'BANK_UPDATED', {
        id,
        before: before ? { ...before, accountNumber: undefined } : null,
        after: { ...account.toObject(), accountNumber: undefined }
      });

      res.status(200).json({ success: true, message: 'Bank account updated', data: { account: account.getMaskedAccount() } });
    } catch (error) {
      next(error);
    }
  }


  async deleteBankAccount(req, res, next) {
    try {
      const { id } = req.params;
      const { transactionPin } = req.body;

      const { verifyTransactionPin } = require('../utils/transactionPin');
      await verifyTransactionPin(req.user.id, transactionPin, {
        operation: 'BANK_DELETE',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        deviceFingerprint: req.body?.deviceFingerprint
      });

      const before = await BankAccount.findOne({ _id: id, userId: req.user.id }).lean();

      const deleted = await BankAccount.findOneAndDelete({ _id: id, userId: req.user.id });
      if (!deleted) throw new AppError('Bank account not found', 404);

      await logAction(req, 'BANK_DELETED', {
        id,
        before: before ? { ...before, accountNumber: undefined } : null
      });

      res.status(200).json({ success: true, message: 'Bank account deleted' });
    } catch (error) {
      next(error);
    }
  }


  async submitKyc(req, res, next) {
    try {
      // Accept either:
      // 1) JSON-only legacy: { documents: {...} }
      // 2) New multipart upload step output + KYC fields:
      //    {
      //      panNumber, aadhaarNumber, address, dob,
      //      documents: { panImageUrl, aadhaarFrontImageUrl, aadhaarBackImageUrl, selfieImageUrl, passbookImageUrl },
      //      ...
      //    }
      const body = req.body || {};
      const documents = body.documents || body.documentUrls || body;

      const submission = await KycSubmission.findOneAndUpdate(
        { userId: req.user.id },
        {
          $set: {
            // Form fields (new)
            panNumber: body.panNumber ?? body.pan,
            aadhaarNumber: body.aadhaarNumber ?? body.aadhaar,
            address: body.address ?? body.fullAddress ?? body.permanentAddress,
            dob: body.dob ? new Date(body.dob) : body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,


            // Document URLs (new)
            documents: {
              panCard: documents.panImageUrl || documents.panCard || documents.pan || documents.panImage,
              aadhaarCard:
                documents.aadhaarFrontImageUrl || documents.aadhaarCard || documents.aadhaarFrontImage || documents.aadhaarImage,
              selfie: documents.selfieImageUrl || documents.selfie || documents.selfieImage,
              passbook: documents.passbookImageUrl || documents.passbook,
              aadhaarFrontImageUrl: documents.aadhaarFrontImageUrl,
              aadhaarBackImageUrl: documents.aadhaarBackImageUrl,
              panImageUrl: documents.panImageUrl,
              selfieImageUrl: documents.selfieImageUrl,
              aadhaarFront: documents.aadhaarFrontImageUrl,
              aadhaarBack: documents.aadhaarBackImageUrl
            },

            status: 'UNDER_REVIEW'
          }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      await User.findByIdAndUpdate(req.user.id, {
        $set: { accountStatus: STATUSES.ADMIN_REVIEW_PENDING, kycStatus: 'PENDING' }
      });
      await logAction(req, 'KYC_SUBMITTED', submission.documents);
      res.status(200).json({ success: true, message: 'KYC submitted for review', data: { submission } });
    } catch (error) {
      next(error);
    }
  }

  async listByModel(Model, req, res, next, filter = {}) {
    try {
      const items = await Model.find({ userId: req.user.id, ...filter }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: { items } });
    } catch (error) {
      next(error);
    }
  }

  async createMoneyRequest(req, res, next) {
    try {
      const item = await MoneyRequest.create({ ...req.body, requesterId: req.user.id });
      await logAction(req, 'MONEY_REQUEST_CREATED', { id: item._id, amount: item.amount });
      res.status(201).json({ success: true, data: { request: item } });
    } catch (error) {
      next(error);
    }
  }

  async respondMoneyRequest(req, res, next) {
    try {
      const status = req.body.status === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED';
      const item = await MoneyRequest.findOneAndUpdate(
        { _id: req.params.id, payerEmail: req.user.email, status: 'PENDING' },
        { $set: { status, payerId: req.user.id, respondedAt: new Date() } },
        { new: true }
      );
      if (!item) throw new AppError('Money request not found', 404);
      await logAction(req, status === 'ACCEPTED' ? 'MONEY_REQUEST_ACCEPTED' : 'MONEY_REQUEST_REJECTED', { id: item._id });
      res.status(200).json({ success: true, data: { request: item } });
    } catch (error) {
      next(error);
    }
  }

  async createSupportTicket(req, res, next) {
    try {
      if (!req.body.subject || !req.body.message) {
        throw new AppError('Subject and message are required', 400);
      }

      const ticket = await SupportTicket.create({
        userId: req.user.id,
        subject: req.body.subject,
        category: req.body.category,
        priority: req.body.priority,
        attachments: req.body.attachments || [],
        messages: [{ senderId: req.user.id, senderRole: 'USER', message: req.body.message }]
      });
      await logAction(req, 'SUPPORT_TICKET_CREATED', { id: ticket._id });
      res.status(201).json({ success: true, data: { ticket } });
    } catch (error) {
      next(error);
    }
  }

  async getSupportTicket(req, res, next) {
    try {
      const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user.id })
        .populate('assignedTo', 'firstName lastName email role');
      if (!ticket) throw new AppError('Support ticket not found', 404);
      res.status(200).json({ success: true, data: { ticket } });
    } catch (error) {
      next(error);
    }
  }

  async replySupportTicket(req, res, next) {
    try {
      if (!req.body.message) throw new AppError('Reply message is required', 400);

      const ticket = await SupportTicket.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id, status: { $ne: 'CLOSED' } },
        {
          $push: { messages: { senderId: req.user.id, senderRole: 'USER', message: req.body.message } },
          $set: { status: 'OPEN' }
        },
        { new: true }
      );
      if (!ticket) throw new AppError('Support ticket not found or closed', 404);
      await logAction(req, 'SUPPORT_TICKET_REPLIED', { id: ticket._id });

      // Notify assigned admin of user reply
      try {
        if (ticket.assignedTo) {
          await Notification.create({
            userId: ticket.assignedTo,
            type: 'ACCOUNT',
            title: 'User replied to support ticket',
            message: `User replied to "${ticket.subject}"`,
            metadata: { ticketId: ticket._id.toString(), actionUrl: '/admin/tickets' },
            status: 'SENT',
            priority: 'MEDIUM'
          });
        }
      } catch (notifErr) {
        console.error('Failed to create notification for user ticket reply:', notifErr);
      }

      res.status(200).json({ success: true, data: { ticket } });
    } catch (error) {
      next(error);
    }
  }

  createSimple(Model, action, key) {
    return async (req, res, next) => {
      try {
        const item = await Model.create({ ...req.body, userId: req.user.id });
        await logAction(req, action, { id: item._id });
        res.status(201).json({ success: true, data: { [key]: item } });
      } catch (error) {
        next(error);
      }
    };
  }

  updateSimple(Model, action, key, notFoundMessage) {
    return async (req, res, next) => {
      try {
        const item = await Model.findOneAndUpdate(
          { _id: req.params.id, userId: req.user.id },
          { $set: req.body },
          { new: true }
        );
        if (!item) throw new AppError(notFoundMessage, 404);
        await logAction(req, action, { id: item._id });
        res.status(200).json({ success: true, data: { [key]: item } });
      } catch (error) {
        next(error);
      }
    };
  }

  deleteSimple(Model, action, notFoundMessage) {
    return async (req, res, next) => {
      try {
        const item = await Model.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!item) throw new AppError(notFoundMessage, 404);
        await logAction(req, action, { id: req.params.id });
        res.status(200).json({ success: true, message: 'Deleted successfully' });
      } catch (error) {
        next(error);
      }
    };
  }
}

const controller = new OnboardingController();
controller.listBeneficiaries = (req, res, next) => controller.listByModel(Beneficiary, req, res, next);
controller.createBeneficiary = controller.createSimple(Beneficiary, 'BENEFICIARY_ADDED', 'beneficiary');
controller.updateBeneficiary = controller.updateSimple(Beneficiary, 'BENEFICIARY_UPDATED', 'beneficiary', 'Beneficiary not found');
controller.deleteBeneficiary = controller.deleteSimple(Beneficiary, 'BENEFICIARY_DELETED', 'Beneficiary not found');
controller.listMoneyRequests = async (req, res, next) => {
  try {
    const items = await MoneyRequest.find({
      $or: [{ requesterId: req.user.id }, { payerEmail: req.user.email }]
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { items } });
  } catch (error) {
    next(error);
  }
};
controller.listSupportTickets = (req, res, next) => controller.listByModel(SupportTicket, req, res, next);
controller.listNominees = (req, res, next) => controller.listByModel(Nominee, req, res, next);
controller.createNominee = controller.createSimple(Nominee, 'NOMINEE_ADDED', 'nominee');
controller.updateNominee = controller.updateSimple(Nominee, 'NOMINEE_UPDATED', 'nominee', 'Nominee not found');
controller.deleteNominee = controller.deleteSimple(Nominee, 'NOMINEE_DELETED', 'Nominee not found');
controller.listEmergencyContacts = (req, res, next) => controller.listByModel(EmergencyContact, req, res, next);
controller.createEmergencyContact = controller.createSimple(EmergencyContact, 'EMERGENCY_CONTACT_ADDED', 'contact');
controller.updateEmergencyContact = controller.updateSimple(EmergencyContact, 'EMERGENCY_CONTACT_UPDATED', 'contact', 'Emergency contact not found');
controller.deleteEmergencyContact = controller.deleteSimple(EmergencyContact, 'EMERGENCY_CONTACT_DELETED', 'Emergency contact not found');

module.exports = controller;
