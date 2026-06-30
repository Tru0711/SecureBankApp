const mongoose = require('mongoose');

const nomineeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phone: String,
    email: String,
    address: String,
    sharePercentage: { type: Number, min: 1, max: 100, default: 100 }
  },
  { timestamps: true, collection: 'nominees' }
);

module.exports = mongoose.model('Nominee', nomineeSchema);
