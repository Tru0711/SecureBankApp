const mongoose = require('mongoose');

const kycSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Document URLs / file references
    documents: {
      // PAN
      panCard: String,
      panImageUrl: String,

      // Aadhaar (front/back)
      aadhaarCard: String,
      aadhaarFrontImageUrl: String,
      aadhaarBackImageUrl: String,
      aadhaarFrontImage: String,
      aadhaarBackImage: String,

      // Selfie
      selfie: String,
      selfieImageUrl: String,
      selfieImage: String,

      // Optional
      passbook: String,
      passbookImageUrl: String,

      // Legacy / optional
      cancelledCheque: String
    },

    // Extracted KYC fields
    panNumber: { type: String, default: '' },
    aadhaarNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    dob: { type: Date },

    // Verification results (placeholders; may be filled by OCR in future)
    verification: {
      pan: { type: String, default: '' },
      aadhaar: { type: String, default: '' },
      selfie: { type: String, default: '' },
      results: {
        panVerified: { type: Boolean, default: false },
        aadhaarVerified: { type: Boolean, default: false },
        selfieVerified: { type: Boolean, default: false }
      }
    },

    // Admin rejection
    rejectionReason: { type: String, default: '' },
    rejectionRemarks: { type: String, default: '' },



    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REUPLOAD_REQUESTED'],
      default: 'PENDING',
      index: true
    },
    rejectionReason: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  },
  { timestamps: true, collection: 'kycSubmissions' }
);

module.exports = mongoose.model('KycSubmission', kycSubmissionSchema);
