// src/utils/validators.js
export const validateRequired = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'This field is required';
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validateMinLength = (value, minLength) => {
  if (!value || value.length < minLength) {
    return `Must be at least ${minLength} characters long`;
  }
  return null;
};

export const validateMaxLength = (value, maxLength) => {
  if (value && value.length > maxLength) {
    return `Must be no more than ${maxLength} characters long`;
  }
  return null;
};

export const validateNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  
  if (isNaN(value)) {
    return 'Must be a valid number';
  }
  return null;
};

export const validatePositiveNumber = (value) => {
  const numberError = validateNumber(value);
  if (numberError) return numberError;
  
  if (value !== '' && parseFloat(value) < 0) {
    return 'Must be a positive number';
  }
  return null;
};

export const validateUrl = (url) => {
  if (!url) return null;
  
  try {
    new URL(url);
    return null;
  } catch (error) {
    return 'Please enter a valid URL';
  }
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  
  // Fixed: removed unnecessary escape character
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ''))) {
    return 'Please enter a valid phone number';
  }
  return null;
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};