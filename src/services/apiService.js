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
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    if (APP_CONFIG.DEBUG) {
      console.log(`API Request: ${config.method || 'GET'} ${url}`, config);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (APP_CONFIG.DEBUG) {
        console.log(`API Response: ${response.status}`, data);
      }
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }
      
      return {
        success: true,
        data,
        status: response.status
      };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error.message,
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

  async delete(endpoint) {
    return this.request(endpoint, {
      method: HTTP_METHODS.DELETE
    });
  }
}

export default ApiService;