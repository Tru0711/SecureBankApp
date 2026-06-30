const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: String,
    isPrimary: { type: Boolean, default: false }
  },
  { timestamps: true, collection: 'emergencyContacts' }
);

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
