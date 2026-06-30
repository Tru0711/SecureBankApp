// src/utils/helpers.js
const crypto = require('crypto');
const moment = require('moment');

// Generate unique transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `TXN${timestamp}${random}`;
};

// Generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD${timestamp}${random}`;
};

// Generate device fingerprint
const generateDeviceFingerprint = (deviceData) => {
  const data = JSON.stringify(deviceData);
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Encrypt sensitive data
const encryptData = (data, key = process.env.ENCRYPTION_KEY) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
};

// Decrypt sensitive data
const decryptData = (encryptedData, key = process.env.ENCRYPTION_KEY) => {
  const [iv, encrypted, authTag] = encryptedData.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

// Format date
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).format(format);
};

// Get date range
const getDateRange = (days = 30) => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  return { startDate, endDate };
};

// Convert paise to rupees
const paiseToRupees = (paise) => {
  return (paise / 100).toFixed(2);
};

// Convert rupees to paise
const rupeesToPaise = (rupees) => {
  return Math.round(rupees * 100);
};

// Generate random OTP
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Generate random password
const generateRandomPassword = () => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Mask email
const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  const maskedName = name.substring(0, 2) + '*'.repeat(name.length - 2);
  return `${maskedName}@${domain}`;
};

// Mask phone
const maskPhone = (phone) => {
  return phone.substring(0, 2) + '*'.repeat(phone.length - 6) + phone.substring(phone.length - 4);
};

// Mask card number
const maskCardNumber = (cardNumber) => {
  return '*'.repeat(cardNumber.length - 4) + cardNumber.substring(cardNumber.length - 4);
};

module.exports = {
  generateTransactionId,
  generateOrderId,
  generateDeviceFingerprint,
  encryptData,
  decryptData,
  formatDate,
  getDateRange,
  paiseToRupees,
  rupeesToPaise,
  generateOTP,
  generateRandomPassword,
  maskEmail,
  maskPhone,
  maskCardNumber
};
