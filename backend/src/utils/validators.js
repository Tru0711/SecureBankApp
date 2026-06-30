// src/utils/validators.js
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

const validatePhone = (phone) => {
  // Indian phone number: 10 digits starting with 6-9
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone);
};

const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const validateAmount = (amount) => {
  return !isNaN(amount) && amount > 0;
};

const validateTransactionId = (id) => {
  return /^[A-Z0-9]{12,}$/.test(id);
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateURL,
  validateAmount,
  validateTransactionId
};
