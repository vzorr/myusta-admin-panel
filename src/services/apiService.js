// src/services/apiService.js - Added timeout functionality
import { HTTP_METHODS, API_CONFIG } from '../utils/constants';

class ApiService {
  constructor(baseUrl, token = null, timeout = API_CONFIG.TIMEOUT) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.timeout = timeout;
  }

  setToken(token) {
    this.token = token;
  }

  setTimeout(timeout) {
    this.timeout = timeout;
  }

  // Create AbortController with timeout
  createTimeoutController(timeoutMs = this.timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);
    
    return { controller, timeoutId };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const requestTimeout = options.timeout || this.timeout;
    
    // Create timeout controller
    const { controller, timeoutId } = this.createTimeoutController(requestTimeout);
    
    const config = {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      signal: controller.signal, // Add abort signal
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Clear timeout on successful response
      clearTimeout(timeoutId);
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      if (!response.ok) {
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
      // Clear timeout on error
      clearTimeout(timeoutId);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      let errorType = 'UNKNOWN';
      
      if (error.name === 'AbortError') {
        errorMessage = `Request timeout: Request took longer than ${requestTimeout}ms`;
        errorType = 'TIMEOUT';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to server';
        errorType = 'NETWORK';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error: Server configuration issue';
        errorType = 'CORS';
      } else if (error.name === 'TypeError') {
        errorMessage = 'Network error: Request failed';
        errorType = 'NETWORK';
      }
      
      return {
        success: false,
        error: errorMessage,
        status: error.status || 0,
        originalError: error.message,
        errorType,
        timeout: error.name === 'AbortError'
      };
    }
  }

  async get(endpoint, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: HTTP_METHODS.GET,
      ...options
    });
  }

  async post(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(body),
      ...options
    });
  }

  async put(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(body),
      ...options
    });
  }

  async patch(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      method: HTTP_METHODS.PATCH,
      body: JSON.stringify(body),
      ...options
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: HTTP_METHODS.DELETE,
      ...options
    });
  }

  // Convenience methods with custom timeouts
  async quickGet(endpoint, params = {}, timeoutMs = 5000) {
    return this.get(endpoint, params, { timeout: timeoutMs });
  }

  async quickPost(endpoint, body = {}, timeoutMs = 5000) {
    return this.post(endpoint, body, { timeout: timeoutMs });
  }

  async slowRequest(endpoint, options = {}, timeoutMs = 60000) {
    return this.request(endpoint, { ...options, timeout: timeoutMs });
  }

  updateToken(newToken) {
    this.setToken(newToken);
  }

  clearToken() {
    this.token = null;
  }
}

export default ApiService;
