const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true, trim: true },
    category: { type: String, default: 'GENERAL' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    closedAt: Date,
    resolvedAt: Date,
    attachments: [String],
    messages: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        senderRole: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true, collection: 'supportTickets' }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
