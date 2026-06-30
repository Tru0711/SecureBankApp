export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Invalid email format';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Must contain a number';
  if (!/[!@#$%^&*]/.test(password)) return 'Must contain a special character (!@#$%^&*)';
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  const re = /^[0-9]{10}$/;
  if (!re.test(phone)) return 'Invalid phone number (10 digits required)';
  return '';
};

export const validateName = (name, fieldName = 'Name') => {
  if (!name || !name.trim()) return `${fieldName} is required`;
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
  return '';
};

export const validateAmount = (amount, min = 1, max = 1000000) => {
  if (!amount && amount !== 0) return 'Amount is required';
  const num = Number(amount);
  if (isNaN(num) || num <= 0) return 'Amount must be greater than 0';
  if (num < min) return `Minimum amount is ${min}`;
  if (num > max) return `Maximum amount is ${max}`;
  return '';
};

export const validateOtp = (otp) => {
  if (!otp) return 'OTP is required';
  const re = /^[0-9]{6}$/;
  if (!re.test(otp)) return 'OTP must be 6 digits';
  return '';
};

export const validatePinFormat = (pin) => {
  if (!pin) return 'Transaction PIN is required';
  if (!/^\d{4,6}$/.test(String(pin))) return 'Transaction PIN must be 4 to 6 digits';
  return '';
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && !value.trim())) return `${fieldName} is required`;
  return '';
};

export const getFormErrors = (values, rules) => {
  const errors = {};
  for (const [field, ruleFn] of Object.entries(rules)) {
    const error = ruleFn(values[field]);
    if (error) errors[field] = error;
  }
  return errors;
};

export const isValidForm = (errors) => Object.keys(errors).length === 0;
