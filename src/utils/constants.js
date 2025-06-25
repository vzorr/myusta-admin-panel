// src/utils/constants.js
export const API_ENDPOINTS = {
  MYUSTA_BACKEND: process.env.REACT_APP_MYUSTA_BACKEND_URL || 'https://myusta.al/myusta-backend',
  CHAT_BACKEND: process.env.REACT_APP_CHAT_BACKEND_URL || 'https://myusta.al/chat-backend'
};

// Login credentials from environment variables
export const LOGIN_CREDENTIALS = {
  emailOrPhone: process.env.REACT_APP_LOGIN_EMAIL || 'amirsohail680@gmail.com',
  password: process.env.REACT_APP_LOGIN_PASSWORD || '',
  role: process.env.REACT_APP_LOGIN_ROLE || 'customer'
};

export const APP_CONFIG = {
  APP_NAME: process.env.REACT_APP_APP_NAME || 'Admin Panel',
  DEBUG: process.env.REACT_APP_DEBUG === 'true' || process.env.NODE_ENV === 'development',
  TOKEN_KEY: 'adminToken',
  USE_MOCK_API: process.env.REACT_APP_USE_MOCK_API === 'true',
  LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || 'info',
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  ENABLE_ERROR_BOUNDARY: process.env.REACT_APP_ENABLE_ERROR_BOUNDARY !== 'false'
};

// API Configuration
export const API_CONFIG = {
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  },
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  MAX_RETRY_ATTEMPTS: parseInt(process.env.REACT_APP_MAX_RETRY_ATTEMPTS) || 3,
  MAX_BODY_LENGTH: Infinity,
  MAX_CONTENT_LENGTH: Infinity
};

export const TABLE_ACTIONS = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  SAVE: 'save',
  CANCEL: 'cancel',
  CREATE: 'create',
  REFRESH: 'refresh'
};

export const BACKEND_TYPES = {
  MYUSTA: 'myusta',
  CHAT: 'chat'
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
};

// Default table configurations
export const DEFAULT_TABLES = {
  MYUSTA: [
    { 
      name: 'users', 
      endpoint: '/api/users', 
      displayName: 'Users',
      description: 'User accounts and profiles',
      icon: 'Users'
    },
    { 
      name: 'orders', 
      endpoint: '/api/orders', 
      displayName: 'Orders',
      description: 'Customer orders and transactions',
      icon: 'ShoppingCart'
    },
    { 
      name: 'products', 
      endpoint: '/api/products', 
      displayName: 'Products',
      description: 'Product catalog and inventory',
      icon: 'Package'
    },
    { 
      name: 'categories', 
      endpoint: '/api/categories', 
      displayName: 'Categories',
      description: 'Product categories and classifications',
      icon: 'Tag'
    }
  ],
  CHAT: [
    { 
      name: 'conversations', 
      endpoint: '/api/conversations', 
      displayName: 'Conversations',
      description: 'Chat conversations and threads',
      icon: 'MessageCircle'
    },
    { 
      name: 'messages', 
      endpoint: '/api/messages', 
      displayName: 'Messages',
      description: 'Individual chat messages',
      icon: 'Message'
    },
    { 
      name: 'users', 
      endpoint: '/api/users', 
      displayName: 'Chat Users',
      description: 'Chat system users',
      icon: 'Users'
    }
  ]
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 1000
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  ISO_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
  TIME_ONLY: 'HH:mm:ss'
};

// Validation rules - Fixed regex patterns
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[1-9][\d]{0,15}$/, // Fixed: removed unnecessary escape
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  MAX_TEXT_LENGTH: 1000,
  MAX_EMAIL_LENGTH: 254,
  MAX_PASSWORD_LENGTH: 128
};

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  MODAL_Z_INDEX: 1000,
  DROPDOWN_Z_INDEX: 999
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An internal server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  SAVE_SUCCESS: 'Changes saved successfully!',
  DELETE_SUCCESS: 'Item deleted successfully!',
  CREATE_SUCCESS: 'Item created successfully!',
  UPDATE_SUCCESS: 'Item updated successfully!'
};