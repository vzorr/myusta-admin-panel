import { URL_MAPPINGS, urlHelpers, debugUrls } from '../config/urlMappings';

export const API_ENDPOINTS = {
  // Use URL mappings
  MYUSTA_BACKEND: URL_MAPPINGS.base.myusta,     // /api/myusta in dev, full URL in prod
  CHAT_BACKEND: URL_MAPPINGS.base.chat,         // /api/chat in dev, full URL in prod
};
export { URL_MAPPINGS, urlHelpers };

if (process.env.NODE_ENV === 'development') {
  debugUrls();
}


// Login credentials from environment variables
export const LOGIN_CREDENTIALS = {
  emailOrPhone: process.env.REACT_APP_LOGIN_EMAIL || 'amirsohail680@gmail.com',
  password: process.env.REACT_APP_LOGIN_PASSWORD || 'Password123@', // Added actual password
  role: process.env.REACT_APP_LOGIN_ROLE || 'customer'
};

export const APP_CONFIG = {
  APP_NAME: process.env.REACT_APP_APP_NAME || 'MyUsta Admin Panel',
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
  REFRESH: 'refresh',
  SCHEMA: 'schema'
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

// Window types for window management
export const WINDOW_TYPES = {
  TABLE_DATA: 'table_data',
  TABLE_SCHEMA: 'table_schema', 
  RECORD_DETAIL: 'record_detail',
  SEARCH_RESULTS: 'search_results',
  CREATE_RECORD: 'create_record',
  KPI_DETAIL: 'kpi_detail'
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
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
  DROPDOWN_Z_INDEX: 999,
  WINDOW_Z_INDEX_BASE: 100
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
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  CORS_ERROR: 'CORS error: Please check server configuration.',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  TOKEN_EXPIRED: 'Your session has expired. Please login again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  SAVE_SUCCESS: 'Changes saved successfully!',
  DELETE_SUCCESS: 'Item deleted successfully!',
  CREATE_SUCCESS: 'Item created successfully!',
  UPDATE_SUCCESS: 'Item updated successfully!',
  COPY_SUCCESS: 'Copied to clipboard!',
  REFRESH_SUCCESS: 'Data refreshed successfully!'
};

// Database field types with icons and colors
export const FIELD_TYPES = {
  INTEGER: { icon: '🔢', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  STRING: { icon: '📝', color: 'text-green-600', bgColor: 'bg-green-50' },
  TEXT: { icon: '📄', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  BOOLEAN: { icon: '☑️', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  DATE: { icon: '📅', color: 'text-red-600', bgColor: 'bg-red-50' },
  DATEONLY: { icon: '📅', color: 'text-red-600', bgColor: 'bg-red-50' },
  ENUM: { icon: '📋', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  JSON: { icon: '{}', color: 'text-teal-600', bgColor: 'bg-teal-50' },
  JSONB: { icon: '{}', color: 'text-teal-600', bgColor: 'bg-teal-50' },
  FLOAT: { icon: '🔢', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  DECIMAL: { icon: '💰', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
};

// Association types
export const ASSOCIATION_TYPES = {
  HasMany: { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  HasOne: { color: 'text-green-600', bgColor: 'bg-green-100' },
  BelongsTo: { color: 'text-purple-600', bgColor: 'bg-purple-100' },
  BelongsToMany: { color: 'text-orange-600', bgColor: 'bg-orange-100' }
};

// Role configurations
export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer', 
  USTA: 'usta'
};

// Window default sizes and positions - Updated to include KPI detail
export const WINDOW_DEFAULTS = {
  TABLE_DATA: { width: 1000, height: 700 },
  TABLE_SCHEMA: { width: 800, height: 600 },
  RECORD_DETAIL: { width: 600, height: 500 },
  SEARCH_RESULTS: { width: 900, height: 600 },
  CREATE_RECORD: { width: 500, height: 400 },
  KPI_DETAIL: { width: 900, height: 650 }
}; 


// KPI Configuration constants
export const KPI_CONFIG = {
  REFRESH_INTERVAL: 300000, // 5 minutes
  CHART_COLORS: [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#F97316'  // orange
  ],
  METRICS: {
    CUSTOMERS: {
      id: 'total_customers',
      title: 'Total Customers',
      description: 'Total registered customers',
      icon: 'Users',
      color: 'blue'
    },
    USTAS: {
      id: 'total_ustas',
      title: 'Total Ustas',
      description: 'Service providers',
      icon: 'UserCheck',
      color: 'green'
    },
    JOBS: {
      id: 'total_jobs',
      title: 'Total Jobs',
      description: 'All job bookings',
      icon: 'Briefcase',
      color: 'purple'
    },
    OPEN_JOBS: {
      id: 'open_jobs',
      title: 'Open Jobs',
      description: 'Jobs waiting for assignment',
      icon: 'Clock',
      color: 'orange'
    },
    ACTIVE_JOBS: {
      id: 'active_jobs',
      title: 'Active Jobs',
      description: 'Currently in progress',
      icon: 'TrendingUp',
      color: 'indigo'
    },
    COMPLETED_JOBS: {
      id: 'completed_jobs',
      title: 'Completed Jobs',
      description: 'Successfully completed',
      icon: 'CheckCircle',
      color: 'emerald'
    },
    CANCELLED_JOBS: {
      id: 'cancelled_jobs',
      title: 'Cancelled Jobs',
      description: 'Cancelled bookings',
      icon: 'XCircle',
      color: 'red'
    },
    REVENUE: {
      id: 'revenue',
      title: 'Total Revenue',
      description: 'Total earnings',
      icon: 'DollarSign',
      color: 'yellow'
    },
    SERVICES: {
      id: 'services',
      title: 'Services',
      description: 'Available services',
      icon: 'Star',
      color: 'pink'
    }
  }
};

// Job status configurations
export const JOB_STATUSES = {
  OPEN: {
    value: 'open',
    label: 'Open',
    color: 'orange',
    description: 'Job posted, waiting for Usta assignment'
  },
  ASSIGNED: {
    value: 'assigned',
    label: 'Assigned',
    color: 'blue',
    description: 'Usta assigned, waiting to start'
  },
  IN_PROGRESS: {
    value: 'in_progress',
    label: 'In Progress',
    color: 'indigo',
    description: 'Work currently being performed'
  },
  COMPLETED: {
    value: 'completed',
    label: 'Completed',
    color: 'green',
    description: 'Job finished successfully'
  },
  CANCELLED: {
    value: 'cancelled',
    label: 'Cancelled',
    color: 'red',
    description: 'Job cancelled by customer or system'
  },
  DISPUTED: {
    value: 'disputed',
    label: 'Disputed',
    color: 'yellow',
    description: 'Payment or quality dispute'
  }
};

// Service categories
export const SERVICE_CATEGORIES = {
  CLEANING: {
    id: 'cleaning',
    name: 'Cleaning',
    icon: '🧹',
    color: 'blue'
  },
  PLUMBING: {
    id: 'plumbing',
    name: 'Plumbing',
    icon: '🔧',
    color: 'cyan'
  },
  ELECTRICAL: {
    id: 'electrical',
    name: 'Electrical',
    icon: '⚡',
    color: 'yellow'
  },
  PAINTING: {
    id: 'painting',
    name: 'Painting',
    icon: '🎨',
    color: 'purple'
  },
  GARDENING: {
    id: 'gardening',
    name: 'Gardening',
    icon: '🌱',
    color: 'green'
  },
  APPLIANCE_REPAIR: {
    id: 'appliance_repair',
    name: 'Appliance Repair',
    icon: '🔨',
    color: 'orange'
  },
  CARPENTRY: {
    id: 'carpentry',
    name: 'Carpentry',
    icon: '🪵',
    color: 'amber'
  },
  BEAUTY: {
    id: 'beauty',
    name: 'Beauty & Wellness',
    icon: '💄',
    color: 'pink'
  }
};

// Dashboard layout configurations
export const DASHBOARD_CONFIG = {
  KPI_CARDS: {
    COLUMNS: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      wide: 4
    },
    ANIMATION: {
      duration: 200,
      stagger: 50
    }
  },
  REFRESH_INTERVALS: {
    FAST: 60000,    // 1 minute
    NORMAL: 300000, // 5 minutes
    SLOW: 900000    // 15 minutes
  }
};

// Analytics time periods
export const TIME_PERIODS = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  CUSTOM: 'custom'
};