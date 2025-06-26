// src/config/urlMappings.js - Updated to use environment variables directly

const isDevelopment = process.env.NODE_ENV === 'development';

// Base URLs from environment variables or fallbacks
const BASE_URLS = {
  development: {
    // Get from environment variables or fallback to defaults
    myusta: process.env.REACT_APP_MYUSTA_BACKEND_URL || 'http://localhost:3000',
    chat: process.env.REACT_APP_CHAT_BACKEND_URL || 'http://localhost:5000',
  },
  production: {
    myusta: process.env.REACT_APP_MYUSTA_BACKEND_URL || 'https://myusta.al/myusta-backend',
    chat: process.env.REACT_APP_CHAT_BACKEND_URL || 'https://chat.myusta.al',
  },
  staging: {
    myusta: process.env.REACT_APP_MYUSTA_BACKEND_URL || 'https://staging.myusta.al/myusta-backend',
    chat: process.env.REACT_APP_CHAT_BACKEND_URL || 'https://staging-chat.myusta.al',
  }
};

// Get current environment URLs
const getCurrentUrls = () => {
  const env = process.env.NODE_ENV || 'development';
  return BASE_URLS[env] || BASE_URLS.development;
};

// Complete URL mapping with environment-based URLs
export const URL_MAPPINGS = {
  // Base URLs
  base: getCurrentUrls(),
  
  // MyUsta backend endpoints
  myusta: {
    // Admin endpoints
    admin: {
      models: () => `${getCurrentUrls().myusta}/api/admin/models`,
      model: (modelName) => `${getCurrentUrls().myusta}/api/admin/models/${modelName}`,
      modelSchema: (modelName) => `${getCurrentUrls().myusta}/api/admin/models/${modelName}/schema`,
      record: (modelName, recordId) => `${getCurrentUrls().myusta}/api/admin/models/${modelName}/records/${recordId}`,
      records: (modelName) => `${getCurrentUrls().myusta}/api/admin/models/${modelName}/records`,
      health: () => `${getCurrentUrls().myusta}/api/admin/health`,
      stats: () => `${getCurrentUrls().myusta}/api/admin/stats`,
      users: () => `${getCurrentUrls().myusta}/api/admin/users`,
      services: () => `${getCurrentUrls().myusta}/api/admin/services`,
      bookings: () => `${getCurrentUrls().myusta}/api/admin/bookings`,
      // Enhanced v2 endpoints
      v2: {
        models: () => `${getCurrentUrls().myusta}/api/admin/v2/models`,
        model: (modelName) => `${getCurrentUrls().myusta}/api/admin/v2/models/${modelName}`,
        modelSchema: (modelName) => `${getCurrentUrls().myusta}/api/admin/v2/models/${modelName}/schema`,
        record: (modelName, recordId) => `${getCurrentUrls().myusta}/api/admin/v2/models/${modelName}/records/${recordId}`,
        records: (modelName) => `${getCurrentUrls().myusta}/api/admin/v2/models/${modelName}/records`,
        config: () => `${getCurrentUrls().myusta}/api/admin/config`
      }
    },
    
    // Authentication endpoints
    auth: {
      login: () => `${getCurrentUrls().myusta}/api/auth/login`,
      logout: () => `${getCurrentUrls().myusta}/api/auth/logout`,
      refresh: () => `${getCurrentUrls().myusta}/api/auth/refresh`,
      validate: () => `${getCurrentUrls().myusta}/api/auth/validate`,
      profile: () => `${getCurrentUrls().myusta}/api/auth/profile`
    },
    
    // User endpoints
    users: {
      list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return `${getCurrentUrls().myusta}/api/users${query ? `?${query}` : ''}`;
      },
      create: () => `${getCurrentUrls().myusta}/api/users`,
      update: (userId) => `${getCurrentUrls().myusta}/api/users/${userId}`,
      delete: (userId) => `${getCurrentUrls().myusta}/api/users/${userId}`,
      profile: (userId) => `${getCurrentUrls().myusta}/api/users/${userId}/profile`
    },
    
    // Service endpoints
    services: {
      list: () => `${getCurrentUrls().myusta}/api/services`,
      create: () => `${getCurrentUrls().myusta}/api/services`,
      update: (serviceId) => `${getCurrentUrls().myusta}/api/services/${serviceId}`,
      delete: (serviceId) => `${getCurrentUrls().myusta}/api/services/${serviceId}`,
      categories: () => `${getCurrentUrls().myusta}/api/services/categories`
    },
    
    // Booking endpoints
    bookings: {
      list: () => `${getCurrentUrls().myusta}/api/bookings`,
      create: () => `${getCurrentUrls().myusta}/api/bookings`,
      update: (bookingId) => `${getCurrentUrls().myusta}/api/bookings/${bookingId}`,
      cancel: (bookingId) => `${getCurrentUrls().myusta}/api/bookings/${bookingId}/cancel`,
      status: (bookingId) => `${getCurrentUrls().myusta}/api/bookings/${bookingId}/status`
    }
  },
  
  // Chat backend endpoints
  chat: {
    // Admin endpoints
    admin: {
      models: () => `${getCurrentUrls().chat}/api/v1/admin/models`,
      model: (modelName) => `${getCurrentUrls().chat}/api/v1/admin/models/${modelName}`,
      modelSchema: (modelName) => `${getCurrentUrls().chat}/api/v1/admin/models/${modelName}/schema`,
      record: (modelName, recordId) => `${getCurrentUrls().chat}/api/v1/admin/models/${modelName}/records/${recordId}`,
      records: (modelName) => `${getCurrentUrls().chat}/api/v1/admin/models/${modelName}/records`,
      health: () => `${getCurrentUrls().chat}/api/v1/admin/health`,
      stats: () => `${getCurrentUrls().chat}/api/v1/admin/stats`,
      
      // Chat-specific admin endpoints
      users: () => `${getCurrentUrls().chat}/api/v1/admin/users`,
      conversations: () => `${getCurrentUrls().chat}/api/v1/admin/conversations`,
      messages: () => `${getCurrentUrls().chat}/api/v1/admin/messages`,
      deviceTokens: () => `${getCurrentUrls().chat}/api/v1/admin/device-tokens`,
      
      // Enhanced chat admin endpoints
      v2: {
        models: () => `${getCurrentUrls().chat}/api/v1/admin/v2/models`,
        model: (modelName) => `${getCurrentUrls().chat}/api/v1/admin/v2/models/${modelName}`,
        modelSchema: (modelName) => `${getCurrentUrls().chat}/api/v1/admin/v2/models/${modelName}/schema`,
        record: (modelName, recordId) => `${getCurrentUrls().chat}/api/v1/admin/v2/models/${modelName}/records/${recordId}`,
        records: (modelName) => `${getCurrentUrls().chat}/api/v1/admin/v2/models/${modelName}/records`,
        config: () => `${getCurrentUrls().chat}/api/v1/admin/config`
      }
    },
    
    // Regular chat endpoints
    conversations: {
      list: () => `${getCurrentUrls().chat}/api/v1/conversations`,
      create: () => `${getCurrentUrls().chat}/api/v1/conversations`,
      get: (conversationId) => `${getCurrentUrls().chat}/api/v1/conversations/${conversationId}`,
      update: (conversationId) => `${getCurrentUrls().chat}/api/v1/conversations/${conversationId}`,
      delete: (conversationId) => `${getCurrentUrls().chat}/api/v1/conversations/${conversationId}`,
      messages: (conversationId) => `${getCurrentUrls().chat}/api/v1/conversations/${conversationId}/messages`,
      markRead: (conversationId) => `${getCurrentUrls().chat}/api/v1/conversations/${conversationId}/read`,
      participants: (conversationId) => `${getCurrentUrls().chat}/api/v1/conversations/${conversationId}/participants`
    },
    
    messages: {
      send: () => `${getCurrentUrls().chat}/api/v1/messages`,
      get: (messageId) => `${getCurrentUrls().chat}/api/v1/messages/${messageId}`,
      edit: (messageId) => `${getCurrentUrls().chat}/api/v1/messages/${messageId}`,
      delete: (messageId) => `${getCurrentUrls().chat}/api/v1/messages/${messageId}`,
      list: () => `${getCurrentUrls().chat}/api/v1/messages`,
      search: () => `${getCurrentUrls().chat}/api/v1/messages/search`,
      markAsRead: (messageId) => `${getCurrentUrls().chat}/api/v1/messages/${messageId}/read`,
      react: (messageId) => `${getCurrentUrls().chat}/api/v1/messages/${messageId}/react`
    },
    
    // User management in chat
    users: {
      list: () => `${getCurrentUrls().chat}/api/v1/users`,
      create: () => `${getCurrentUrls().chat}/api/v1/users`,
      get: (userId) => `${getCurrentUrls().chat}/api/v1/users/${userId}`,
      update: (userId) => `${getCurrentUrls().chat}/api/v1/users/${userId}`,
      delete: (userId) => `${getCurrentUrls().chat}/api/v1/users/${userId}`,
      profile: (userId) => `${getCurrentUrls().chat}/api/v1/users/${userId}/profile`,
      status: (userId) => `${getCurrentUrls().chat}/api/v1/users/${userId}/status`,
      conversations: (userId) => `${getCurrentUrls().chat}/api/v1/users/${userId}/conversations`
    },
    
    // Device token management
    deviceTokens: {
      register: () => `${getCurrentUrls().chat}/api/v1/device-tokens/register`,
      update: (tokenId) => `${getCurrentUrls().chat}/api/v1/device-tokens/${tokenId}`,
      delete: (tokenId) => `${getCurrentUrls().chat}/api/v1/device-tokens/${tokenId}`,
      list: (userId) => `${getCurrentUrls().chat}/api/v1/users/${userId}/device-tokens`
    },
    
    // Notification endpoints
    notifications: {
      send: () => `${getCurrentUrls().chat}/api/v1/notifications/send`,
      list: (userId) => `${getCurrentUrls().chat}/api/v1/users/${userId}/notifications`,
      markRead: (notificationId) => `${getCurrentUrls().chat}/api/v1/notifications/${notificationId}/read`,
      settings: (userId) => `${getCurrentUrls().chat}/api/v1/users/${userId}/notification-settings`
    },
    
    // WebSocket endpoints
    websocket: {
      connect: () => `${getCurrentUrls().chat.replace('http', 'ws')}/ws`,
      conversation: (conversationId) => `${getCurrentUrls().chat.replace('http', 'ws')}/ws/conversations/${conversationId}`,
      user: (userId) => `${getCurrentUrls().chat.replace('http', 'ws')}/ws/users/${userId}`
    }
  }
};

// Helper functions for building URLs with parameters
export const urlHelpers = {
  // Build URL with query parameters
  withQuery: (baseUrl, params = {}) => {
    const cleanParams = Object.entries(params).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    );
    
    if (cleanParams.length === 0) return baseUrl;
    
    const queryString = new URLSearchParams(cleanParams).toString();
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${queryString}`;
  },
  
  // Build paginated URL
  withPagination: (baseUrl, page = 1, size = 20, additionalParams = {}) => {
    return urlHelpers.withQuery(baseUrl, {
      page,
      size,
      ...additionalParams
    });
  },
  
  // Build search URL
  withSearch: (baseUrl, searchTerm, additionalParams = {}) => {
    return urlHelpers.withQuery(baseUrl, {
      search: searchTerm,
      ...additionalParams
    });
  },
  
  // Build sorted URL
  withSort: (baseUrl, sortBy, sortOrder = 'ASC', additionalParams = {}) => {
    return urlHelpers.withQuery(baseUrl, {
      sortBy,
      sortOrder,
      ...additionalParams
    });
  },
  
  // Build filtered URL
  withFilters: (baseUrl, filters = {}, additionalParams = {}) => {
    return urlHelpers.withQuery(baseUrl, {
      ...filters,
      ...additionalParams
    });
  },
  
  // Build date range URL
  withDateRange: (baseUrl, startDate, endDate, additionalParams = {}) => {
    return urlHelpers.withQuery(baseUrl, {
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() }),
      ...additionalParams
    });
  }
};

// Backend health check URLs
export const HEALTH_CHECK_URLS = {
  myusta: URL_MAPPINGS.myusta.admin.health(),
  chat: URL_MAPPINGS.chat.admin.health()
};

// WebSocket connection helper
export const createWebSocketUrl = (endpoint) => {
  const baseUrl = getCurrentUrls().chat;
  return baseUrl.replace(/^http/, 'ws') + endpoint;
};

// Debug helper
export const debugUrls = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔗 API Routes Debug (Environment Variables)');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Environment Variables:');
    console.log('  REACT_APP_MYUSTA_BACKEND_URL:', process.env.REACT_APP_MYUSTA_BACKEND_URL);
    console.log('  REACT_APP_CHAT_BACKEND_URL:', process.env.REACT_APP_CHAT_BACKEND_URL);
    console.log('');
    console.log('Resolved Base URLs:', getCurrentUrls());
    console.log('');
    console.log('MyUsta Routes:');
    console.log('  Admin Models:', URL_MAPPINGS.myusta.admin.models());
    console.log('  Auth Login:', URL_MAPPINGS.myusta.auth.login());
    console.log('  Users List:', URL_MAPPINGS.myusta.users.list());
    console.log('  V2 Models:', URL_MAPPINGS.myusta.admin.v2.models());
    console.log('');
    console.log('Chat Routes:');
    console.log('  Admin Models:', URL_MAPPINGS.chat.admin.models());
    console.log('  Conversations:', URL_MAPPINGS.chat.conversations.list());
    console.log('  Messages:', URL_MAPPINGS.chat.messages.list());
    console.log('  Device Tokens:', URL_MAPPINGS.chat.admin.deviceTokens());
    console.log('  Health Check:', URL_MAPPINGS.chat.admin.health());
    console.log('  V2 Models:', URL_MAPPINGS.chat.admin.v2.models());
    console.log('');
    console.log('WebSocket URLs:');
    console.log('  Chat Connect:', URL_MAPPINGS.chat.websocket.connect());
    console.log('');
    console.log('Health Check URLs:');
    console.log('  MyUsta:', HEALTH_CHECK_URLS.myusta);
    console.log('  Chat:', HEALTH_CHECK_URLS.chat);
    console.groupEnd();
  }
};

// Environment validation
export const validateEnvironment = () => {
  const warnings = [];
  const errors = [];
  
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.REACT_APP_MYUSTA_BACKEND_URL) {
      warnings.push('REACT_APP_MYUSTA_BACKEND_URL not set, using default');
    }
    if (!process.env.REACT_APP_CHAT_BACKEND_URL) {
      warnings.push('REACT_APP_CHAT_BACKEND_URL not set, using default');
    }
  }
  
  // Validate URLs are properly formatted
  const urls = getCurrentUrls();
  if (!urls.myusta.startsWith('http')) {
    errors.push('MyUsta backend URL must start with http:// or https://');
  }
  if (!urls.chat.startsWith('http')) {
    errors.push('Chat backend URL must start with http:// or https://');
  }
  
  return { warnings, errors };
};

// Auto-run debug in development
if (process.env.NODE_ENV === 'development') {
  debugUrls();
  const { warnings, errors } = validateEnvironment();
  if (warnings.length > 0) {
    console.warn('⚠️ Environment warnings:', warnings);
  }
  if (errors.length > 0) {
    console.error('❌ Environment errors:', errors);
  }
}