const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    bankName: String,
    accountNumberLast4: String,
    ifsc: { type: String, uppercase: true, trim: true },
    nickname: String,
    isFavorite: { type: Boolean, default: false },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
  },
  { timestamps: true, collection: 'beneficiaries' }
);

module.exports = mongoose.model('Beneficiary', beneficiarySchema);
