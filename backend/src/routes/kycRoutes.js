const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authMiddleware');
const onboardingController = require('../controllers/onboardingController');
const { uploadKycDocs, publicUrlForFile } = require('../upload/kycUpload');

// Upload documents (multipart)
// Returns document URLs that client can submit with PAN/Aadhaar numbers/address/DOB.
router.post(
  '/kyc/upload',
  authenticate,
  uploadKycDocs,
  async (req, res, next) => {
    try {
      const submissionId = req.body?.submissionId || req.body?.kycSubmissionId || null;

      // multer stores files in req.files[fieldName]
      const files = req.files || {};

      const pickFirst = (field) => (files[field] && files[field][0] ? files[field][0] : null);

      const pan = pickFirst('panImage');
      const aadhaarFront = pickFirst('aadhaarFrontImage');
      const aadhaarBack = pickFirst('aadhaarBackImage');
      const selfie = pickFirst('selfieImage');
      const passbook = pickFirst('passbookImage');

      // Convert absolute path to public URL via server static route.
      const toUrl = (f) => (f ? publicUrlForFile(req, f.path) : null);

      const urls = {
        panImageUrl: toUrl(pan),
        aadhaarFrontImageUrl: toUrl(aadhaarFront),
        aadhaarBackImageUrl: toUrl(aadhaarBack),
        selfieImageUrl: toUrl(selfie),
        passbookImageUrl: toUrl(passbook),
        submissionId
      };

      res.status(200).json({ success: true, data: { urls } });
    } catch (error) {
      next(error);
    }
  }
);

// Create/update KYC submission (JSON)
router.post('/kyc', authenticate, onboardingController.submitKyc);

module.exports = router;

