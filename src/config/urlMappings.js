// src/config/urlMappings.js

const isDevelopment = process.env.NODE_ENV === 'development';

// Base URLs for different environments
const BASE_URLS = {
  development: {
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

// Complete URL mapping with correct API routes
export const URL_MAPPINGS = {
  // Base URLs
  base: getCurrentUrls(),
  
  // MyUsta backend endpoints (localhost:3000 with /api/admin)
  myusta: {
    // Admin endpoints - localhost:3000/api/admin/*
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
      bookings: () => `${getCurrentUrls().myusta}/api/admin/bookings`
    },
    
    // Authentication endpoints - localhost:3000/api/auth/*
    auth: {
      login: () => `${getCurrentUrls().myusta}/api/auth/login`,
      logout: () => `${getCurrentUrls().myusta}/api/auth/logout`,
      refresh: () => `${getCurrentUrls().myusta}/api/auth/refresh`,
      validate: () => `${getCurrentUrls().myusta}/api/auth/validate`,
      profile: () => `${getCurrentUrls().myusta}/api/auth/profile`
    },
    
    // User endpoints - localhost:3000/api/users/*
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
    
    // Service endpoints - localhost:3000/api/services/*
    services: {
      list: () => `${getCurrentUrls().myusta}/api/services`,
      create: () => `${getCurrentUrls().myusta}/api/services`,
      update: (serviceId) => `${getCurrentUrls().myusta}/api/services/${serviceId}`,
      delete: (serviceId) => `${getCurrentUrls().myusta}/api/services/${serviceId}`,
      categories: () => `${getCurrentUrls().myusta}/api/services/categories`
    },
    
    // Booking endpoints - localhost:3000/api/bookings/*
    bookings: {
      list: () => `${getCurrentUrls().myusta}/api/bookings`,
      create: () => `${getCurrentUrls().myusta}/api/bookings`,
      update: (bookingId) => `${getCurrentUrls().myusta}/api/bookings/${bookingId}`,
      cancel: (bookingId) => `${getCurrentUrls().myusta}/api/bookings/${bookingId}/cancel`,
      status: (bookingId) => `${getCurrentUrls().myusta}/api/bookings/${bookingId}/status`
    }
  },
  
  // Chat backend endpoints (localhost:5000 with /api/v1/admin)
  chat: {
    // Admin endpoints - localhost:5000/api/v1/admin/*
    admin: {
      models: () => `${getCurrentUrls().chat}/api/v1/admin/models`,
      model: (modelName) => `${getCurrentUrls().chat}/api/v1/admin/models/${modelName}`,
      modelSchema: (modelName) => `${getCurrentUrls().chat}/api/v1/admin/models/${modelName}/schema`,
      record: (modelName, recordId) => `${getCurrentUrls().chat}/api/v1/admin/models/${modelName}/records/${recordId}`,
      records: (modelName) => `${getCurrentUrls().chat}/api/v1/admin/models/${modelName}/records`,
      health: () => `${getCurrentUrls().chat}/api/v1/admin/health`,
      stats: () => `${getCurrentUrls().chat}/api/v1/admin/stats`,
      users: () => `${getCurrentUrls().chat}/api/v1/admin/users`,
      conversations: () => `${getCurrentUrls().chat}/api/v1/admin/conversations`,
      messages: () => `${getCurrentUrls().chat}/api/v1/admin/messages`
    },
    
    // Regular chat endpoints - localhost:5000/api/v1/*
    conversations: {
      list: () => `${getCurrentUrls().chat}/api/v1/conversations`,
      create: () => `${getCurrentUrls().chat}/api/v1/conversations`,
      messages: (conversationId) => `${getCurrentUrls().chat}/api/v1/conversations/${conversationId}/messages`,
      markRead: (conversationId) => `${getCurrentUrls().chat}/api/v1/conversations/${conversationId}/read`
    },
    
    messages: {
      send: () => `${getCurrentUrls().chat}/api/v1/messages`,
      edit: (messageId) => `${getCurrentUrls().chat}/api/v1/messages/${messageId}`,
      delete: (messageId) => `${getCurrentUrls().chat}/api/v1/messages/${messageId}`,
      list: () => `${getCurrentUrls().chat}/api/v1/messages`
    },
    
    // User management in chat
    users: {
      list: () => `${getCurrentUrls().chat}/api/v1/users`,
      create: () => `${getCurrentUrls().chat}/api/v1/users`,
      update: (userId) => `${getCurrentUrls().chat}/api/v1/users/${userId}`,
      delete: (userId) => `${getCurrentUrls().chat}/api/v1/users/${userId}`
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
  }
};

// Debug helper
export const debugUrls = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔗 API Routes Debug');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Base URLs:', getCurrentUrls());
    console.log('');
    console.log('MyUsta Routes (localhost:3000):');
    console.log('  Admin Models:', URL_MAPPINGS.myusta.admin.models());
    console.log('  Auth Login:', URL_MAPPINGS.myusta.auth.login());
    console.log('  Users List:', URL_MAPPINGS.myusta.users.list());
    console.log('');
    console.log('Chat Routes (localhost:5000):');
    console.log('  Admin Models:', URL_MAPPINGS.chat.admin.models());
    console.log('  Conversations:', URL_MAPPINGS.chat.conversations.list());
    console.log('  Messages:', URL_MAPPINGS.chat.messages.list());
    console.groupEnd();
  }
};