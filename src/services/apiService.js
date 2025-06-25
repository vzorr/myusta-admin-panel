// src/services/apiService.js
import { HTTP_METHODS, APP_CONFIG } from '../utils/constants';

class ApiService {
  constructor(baseUrl, token = null) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      mode: 'cors', // Explicitly set CORS mode
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    if (APP_CONFIG.DEBUG) {
      console.log(`API Request: ${config.method || 'GET'} ${url}`, {
        ...config,
        headers: {
          ...config.headers,
          // Mask the token in logs for security
          ...(config.headers.Authorization && {
            Authorization: `Bearer ${config.headers.Authorization.split(' ')[1]?.substring(0, 20)}...`
          })
        }
      });
    }

    try {
      const response = await fetch(url, config);
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      if (APP_CONFIG.DEBUG) {
        console.log(`API Response: ${response.status}`, data);
      }
      
      if (!response.ok) {
        // Handle different error response formats
        const errorMessage = typeof data === 'object' 
          ? (data.message || data.error || `HTTP Error: ${response.status}`)
          : data || `HTTP Error: ${response.status}`;
        
        throw new Error(errorMessage);
      }
      
      return {
        success: true,
        data,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to server';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error: Server configuration issue';
      }
      
      return {
        success: false,
        error: errorMessage,
        status: error.status || 0
      };
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: HTTP_METHODS.GET
    });
  }

  async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(body)
    });
  }

  async put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(body)
    });
  }

  async patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: HTTP_METHODS.PATCH,
      body: JSON.stringify(body)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: HTTP_METHODS.DELETE
    });
  }

  // Method to update token for all subsequent requests
  updateToken(newToken) {
    this.setToken(newToken);
  }

  // Method to clear token
  clearToken() {
    this.token = null;
  }
}

export default ApiService;