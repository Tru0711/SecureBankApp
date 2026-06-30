const mongoose = require('mongoose');

const moneyRequestSchema = new mongoose.Schema(
  {
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    payerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    payerEmail: { type: String, required: true, lowercase: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    description: String,
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    respondedAt: Date
  },
  { timestamps: true, collection: 'moneyRequests' }
);

module.exports = mongoose.model('MoneyRequest', moneyRequestSchema);
