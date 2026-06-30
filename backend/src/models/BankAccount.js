const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    bankName: { type: String, required: true, trim: true },
    accountHolderName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, select: false },
    accountNumberLast4: { type: String, required: true },
    ifsc: { type: String, required: true, uppercase: true, trim: true },
    branch: { type: String, trim: true },
    accountType: {
      type: String,
      enum: ['SAVINGS', 'CURRENT', 'SALARY', 'NRE', 'NRO'],
      default: 'SAVINGS'
    },
    isPrimary: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION'],
      default: 'PENDING_VERIFICATION'
    }
  },
  { timestamps: true, collection: 'bankAccounts' }
);

bankAccountSchema.index({ userId: 1, isPrimary: 1 });

bankAccountSchema.methods.getMaskedAccount = function () {
  const account = this.toObject();
  delete account.accountNumber;
  account.maskedAccountNumber = `XXXX XXXX ${account.accountNumberLast4}`;
  return account;
};

module.exports = mongoose.model('BankAccount', bankAccountSchema);
