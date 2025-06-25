// src/utils/constants.js
export const API_ENDPOINTS = {
  MYUSTA_BACKEND: process.env.REACT_APP_MYUSTA_BACKEND_URL || 'https://myusta.al/myusta-backend',
  CHAT_BACKEND: process.env.REACT_APP_CHAT_BACKEND_URL || 'https://myusta.al/chat-backend'
};

// Exact login credentials matching your axios configuration
export const LOGIN_CREDENTIALS = {
  emailOrPhone: process.env.REACT_APP_LOGIN_EMAIL || "amirsohail680@gmail.com",
  password: process.env.REACT_APP_LOGIN_PASSWORD || "",
  role: process.env.REACT_APP_LOGIN_ROLE || "customer"
};

export const APP_CONFIG = {
  APP_NAME: process.env.REACT_APP_APP_NAME || 'Admin Panel',
  DEBUG: process.env.REACT_APP_DEBUG === 'true' || process.env.NODE_ENV === 'development',
  TOKEN_KEY: 'adminToken',
  MAX_BODY_LENGTH: Infinity // Matching your axios config
};

// API Configuration matching your axios setup
export const API_CONFIG = {
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  },
  TIMEOUT: 30000, // 30 seconds
  MAX_BODY_LENGTH: Infinity,
  MAX_CONTENT_LENGTH: Infinity
};

export const TABLE_ACTIONS = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  SAVE: 'save',
  CANCEL: 'cancel'
};

export const BACKEND_TYPES = {
  MYUSTA: 'myusta',
  CHAT: 'chat'
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
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
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Default table configurations
export const DEFAULT_TABLES = {
  MYUSTA: [
    { 
      name: 'users', 
      endpoint: '/api/users', 
      displayName: 'Users',
      description: 'User accounts and profiles'
    },
    { 
      name: 'orders', 
      endpoint: '/api/orders', 
      displayName: 'Orders',
      description: 'Customer orders and transactions'
    },
    { 
      name: 'products', 
      endpoint: '/api/products', 
      displayName: 'Products',
      description: 'Product catalog and inventory'
    },
    { 
      name: 'categories', 
      endpoint: '/api/categories', 
      displayName: 'Categories',
      description: 'Product categories and classifications'
    }
  ],
  CHAT: [
    { 
      name: 'conversations', 
      endpoint: '/api/conversations', 
      displayName: 'Conversations',
      description: 'Chat conversations and threads'
    },
    { 
      name: 'messages', 
      endpoint: '/api/messages', 
      displayName: 'Messages',
      description: 'Individual chat messages'
    },
    { 
      name: 'users', 
      endpoint: '/api/users', 
      displayName: 'Chat Users',
      description: 'Chat system users'
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
  ISO_WITH_TIME: 'YYYY-MM-DD HH:mm:ss'
};

// Validation rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  MAX_TEXT_LENGTH: 1000
};