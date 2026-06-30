const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_ROOT = path.join(__dirname, '../../uploads/kyc');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // submissionId is optional; fall back to userId
    const userId = req.user?.id || 'unknown-user';
    const submissionId = req.body?.submissionId || req.body?.kycSubmissionId || 'temp';
    const dest = path.join(UPLOAD_ROOT, String(userId), String(submissionId));
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // preserve extension
    const ext = path.extname(file.originalname || '').toLowerCase() || '';
    const safeExt = ext.startsWith('.') ? ext : ext ? `.${ext}` : '';
    const ts = Date.now();
    const rand = Math.random().toString(16).slice(2);
    cb(null, `${file.fieldname}-${ts}-${rand}${safeExt}`);
  }
});

function fileFilter(req, file, cb) {
  // Allow common document formats.
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new Error(`Unsupported file type: ${file.mimetype}`));
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Expected fields from the frontend
// - panImage (PAN card)
// - aadhaarFrontImage (Aadhaar front)
// - aadhaarBackImage (Aadhaar back) [optional]
// - selfieImage
// - passbookImage [optional]
const uploadKycDocs = upload.fields([
  { name: 'panImage', maxCount: 1 },
  { name: 'aadhaarFrontImage', maxCount: 1 },
  { name: 'aadhaarBackImage', maxCount: 1 },
  { name: 'selfieImage', maxCount: 1 },
  { name: 'passbookImage', maxCount: 1 }
]);

function publicUrlForFile(req, absPath) {
  // We serve static files from: /api/v1/uploads
  // absPath example: .../uploads/kyc/<user>/<submission>/<filename>
  const rel = absPath.split(path.join('uploads', path.sep))[1];
  if (!rel) return null;

  const proto = req.protocol;
  const host = req.get('host');
  return `${proto}://${host}/api/v1/uploads/${rel.replace(/\\/g, '/')}`;
}

module.exports = {
  uploadKycDocs,
  UPLOAD_ROOT,
  publicUrlForFile
};

