// src/services/apiService.js - Enhanced with detailed logging
import { HTTP_METHODS, APP_CONFIG } from '../utils/constants';
import logger from '../utils/logger';

class ApiService {
  constructor(baseUrl, token = null) {
    this.baseUrl = baseUrl;
    this.token = token;
    
    logger.api('ApiService initialized', {
      baseUrl,
      hasToken: !!token,
      tokenLength: token?.length || 0
    }, 'INIT');
  }

  setToken(token) {
    logger.auth('Setting token in ApiService', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      baseUrl: this.baseUrl
    });
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    // Log the request details
    logger.apiRequest(config.method || 'GET', url, {
      ...config,
      headers: {
        ...config.headers,
        // Mask the token in logs for security
        ...(config.headers.Authorization && {
          Authorization: `Bearer [${config.headers.Authorization.split(' ')[1]?.substring(0, 10)}...]`
        })
      }
    });

    try {
      logger.time(`API-${config.method || 'GET'}-${endpoint}`);
      
      const response = await fetch(url, config);
      
      logger.timeEnd(`API-${config.method || 'GET'}-${endpoint}`);
      
      // Log response details
      logger.api('Response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        logger.debug('Parsed JSON data', { 
          dataType: typeof data,
          dataKeys: typeof data === 'object' && data !== null ? Object.keys(data) : [],
          dataLength: Array.isArray(data) ? data.length : undefined
        });
      } else {
        data = await response.text();
        logger.warn('Non-JSON response received', {
          contentType,
          dataLength: data.length,
          preview: data.substring(0, 100)
        });
      }
      
      if (!response.ok) {
        // Handle different error response formats
        const errorMessage = typeof data === 'object' 
          ? (data.message || data.error || `HTTP Error: ${response.status}`)
          : data || `HTTP Error: ${response.status}`;
        
        logger.error('API request failed', {
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          url,
          responseData: data
        });
        
        throw new Error(errorMessage);
      }
      
      // Log successful response
      logger.apiResponse(response.status, data, url);
      
      return {
        success: true,
        data,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      logger.timeEnd(`API-${config.method || 'GET'}-${endpoint}`);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      let errorType = 'UNKNOWN';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to server';
        errorType = 'NETWORK';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error: Server configuration issue';
        errorType = 'CORS';
      } else if (error.name === 'TypeError') {
        errorMessage = 'Network error: Request failed';
        errorType = 'NETWORK';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout: Server took too long to respond';
        errorType = 'TIMEOUT';
      }
      
      logger.error('API request error', {
        errorType,
        originalError: error.message,
        processedError: errorMessage,
        url,
        method: config.method || 'GET',
        hasToken: !!this.token,
        stack: error.stack
      });
      
      return {
        success: false,
        error: errorMessage,
        status: error.status || 0,
        originalError: error.message,
        errorType
      };
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    logger.debug('GET request prepared', {
      endpoint,
      params,
      finalUrl: url
    });
    
    return this.request(url, {
      method: HTTP_METHODS.GET
    });
  }

  async post(endpoint, body = {}) {
    logger.debug('POST request prepared', {
      endpoint,
      bodyKeys: typeof body === 'object' ? Object.keys(body) : [],
      bodyType: typeof body
    });
    
    return this.request(endpoint, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(body)
    });
  }

  async put(endpoint, body = {}) {
    logger.debug('PUT request prepared', {
      endpoint,
      bodyKeys: typeof body === 'object' ? Object.keys(body) : [],
      bodyType: typeof body
    });
    
    return this.request(endpoint, {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(body)
    });
  }

  async patch(endpoint, body = {}) {
    logger.debug('PATCH request prepared', {
      endpoint,
      bodyKeys: typeof body === 'object' ? Object.keys(body) : [],
      bodyType: typeof body
    });
    
    return this.request(endpoint, {
      method: HTTP_METHODS.PATCH,
      body: JSON.stringify(body)
    });
  }

  async delete(endpoint) {
    logger.debug('DELETE request prepared', { endpoint });
    
    return this.request(endpoint, {
      method: HTTP_METHODS.DELETE
    });
  }

  // Method to update token for all subsequent requests
  updateToken(newToken) {
    logger.auth('Updating token', {
      hadToken: !!this.token,
      hasNewToken: !!newToken,
      newTokenLength: newToken?.length || 0
    });
    this.setToken(newToken);
  }

  // Method to clear token
  clearToken() {
    logger.auth('Clearing token', { hadToken: !!this.token });
    this.token = null;
  }
}

export default ApiService;