// src/middleware/apiLoggingMiddleware.js
import logger from '../utils/logger';

class ApiLoggingMiddleware {
  constructor() {
    this.requestCounter = 0;
    this.activeRequests = new Map();
    this.originalFetch = null;
  }

  // Install the middleware by monkey-patching fetch
  install() {
    if (this.originalFetch) {
      logger.warn('API Logging Middleware already installed');
      return;
    }

    this.originalFetch = window.fetch;
    window.fetch = this.createEnhancedFetch();
    
    logger.success('API Logging Middleware installed successfully', {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }

  // Uninstall the middleware
  uninstall() {
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
      this.originalFetch = null;
      this.activeRequests.clear();
      
      logger.info('API Logging Middleware uninstalled');
    }
  }

  // Create the enhanced fetch function
  createEnhancedFetch() {
    const originalFetch = this.originalFetch;
    
    return async function(url, options = {}) {
      const requestId = this.generateRequestId();
      const startTime = performance.now();
      
      // Prepare request details for logging
      const requestDetails = this.prepareRequestDetails(url, options, requestId, startTime);
      
      // Log the outgoing request
      this.logRequest(requestDetails);
      
      // Store request for tracking
      this.activeRequests.set(requestId, requestDetails);

      try {
        // Execute the original fetch with proper context
        const response = await originalFetch.call(window, url, options);
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        // Clone response to read body without consuming it
        const responseClone = response.clone();
        
        // Prepare response details
        const responseDetails = await this.prepareResponseDetails(
          response, 
          responseClone, 
          requestDetails, 
          duration
        );
        
        // Log the response
        this.logResponse(responseDetails);
        
        // Clean up tracking
        this.activeRequests.delete(requestId);
        
        return response;
        
      } catch (error) {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        // Log the error
        this.logError(error, requestDetails, duration);
        
        // Clean up tracking
        this.activeRequests.delete(requestId);
        
        throw error;
      }
    }.bind(this);
  }

  // Generate unique request ID
  generateRequestId() {
    this.requestCounter++;
    return `REQ-${Date.now()}-${this.requestCounter.toString().padStart(4, '0')}`;
  }

  // Prepare comprehensive request details
  prepareRequestDetails(url, options, requestId, startTime) {
    const method = options.method || 'GET';
    const headers = options.headers || {};
    
    // Parse request body
    let parsedBody = null;
    let bodyInfo = null;
    
    if (options.body) {
      bodyInfo = {
        type: typeof options.body,
        size: options.body.length || 0,
        raw: options.body
      };
      
      try {
        if (typeof options.body === 'string') {
          parsedBody = JSON.parse(options.body);
        } else if (options.body instanceof FormData) {
          parsedBody = 'FormData (cannot parse)';
        } else {
          parsedBody = options.body;
        }
      } catch (e) {
        parsedBody = 'Could not parse body';
      }
    }

    // Extract authentication info
    const authInfo = this.extractAuthInfo(headers);
    
    return {
      requestId,
      timestamp: new Date().toISOString(),
      startTime,
      url,
      method,
      headers: { ...headers },
      body: options.body,
      parsedBody,
      bodyInfo,
      authInfo,
      options: { ...options },
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };
  }

  // Prepare comprehensive response details
  async prepareResponseDetails(response, responseClone, requestDetails, duration) {
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Try to read response body
    let responseData = null;
    let dataInfo = null;
    const contentType = response.headers.get('content-type') || '';

    try {
      if (contentType.includes('application/json')) {
        responseData = await responseClone.json();
        dataInfo = {
          type: 'json',
          size: JSON.stringify(responseData).length,
          keys: typeof responseData === 'object' ? Object.keys(responseData) : null,
          isArray: Array.isArray(responseData),
          length: Array.isArray(responseData) ? responseData.length : null
        };
      } else if (contentType.includes('text/')) {
        responseData = await responseClone.text();
        dataInfo = {
          type: 'text',
          size: responseData.length,
          preview: responseData.substring(0, 200)
        };
      } else {
        responseData = 'Binary or unknown content type';
        dataInfo = {
          type: 'binary',
          contentType
        };
      }
    } catch (error) {
      responseData = `Error reading response: ${error.message}`;
      dataInfo = { type: 'error', error: error.message };
    }

    return {
      requestId: requestDetails.requestId,
      timestamp: new Date().toISOString(),
      duration,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      type: response.type,
      url: response.url,
      redirected: response.redirected,
      headers,
      contentType,
      responseData,
      dataInfo,
      requestDetails
    };
  }

  // Extract authentication information
  extractAuthInfo(headers) {
    const authHeader = headers.Authorization || headers.authorization;
    if (!authHeader) return null;

    const authInfo = {
      type: authHeader.split(' ')[0],
      token: authHeader,
      tokenLength: authHeader.length
    };

    // Try to decode JWT
    if (authInfo.type === 'Bearer') {
      try {
        const token = authHeader.split(' ')[1];
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          authInfo.decodedPayload = payload;
          authInfo.tokenExpiry = payload.exp ? new Date(payload.exp * 1000).toISOString() : null;
          authInfo.tokenIssued = payload.iat ? new Date(payload.iat * 1000).toISOString() : null;
        }
      } catch (e) {
        authInfo.decodeError = e.message;
      }
    }

    return authInfo;
  }

  // Log outgoing request - simplified to prevent console overflow
  logRequest(details) {
    if (!this.shouldLog()) return;
    
    console.group(`🚀 [${details.requestId}] ${details.method} ${details.url}`);
    console.log('⏰', details.timestamp);
    console.log('📋 Headers:', details.headers);
    if (details.parsedBody) {
      console.log('📦 Body:', details.parsedBody);
    }
    console.groupEnd();
  }

  // Log response - simplified to prevent console overflow
  logResponse(details) {
    if (!this.shouldLog()) return;
    
    const emoji = details.ok ? '✅' : '❌';
    console.group(`${emoji} [${details.requestId}] ${details.status} (${details.duration}ms)`);
    console.log('📊 Status:', details.status, details.statusText);
    console.log('📦 Data:', details.responseData);
    console.groupEnd();
  }

  // Log error - simplified
  logError(error, requestDetails, duration) {
    if (!this.shouldLog()) return;
    
    console.group(`💥 [${requestDetails.requestId}] ERROR`);
    console.log('❌ Error:', error.message);
    console.log('🌐 URL:', requestDetails.url);
    console.log('⚡ Duration:', `${duration}ms`);
    console.groupEnd();
  }

  // Check if we should log (prevent console spam)
  shouldLog() {
    return process.env.NODE_ENV === 'development' && 
           process.env.REACT_APP_DEBUG !== 'false';
  }

  // Get statistics about current requests
  getStats() {
    return {
      totalRequests: this.requestCounter,
      activeRequests: this.activeRequests.size,
      activeRequestIds: Array.from(this.activeRequests.keys()),
      installed: !!this.originalFetch
    };
  }

  // Log current stats
  logStats() {
    const stats = this.getStats();
    logger.info('API Middleware Statistics', stats);
    return stats;
  }
}

// Create singleton instance
const apiLoggingMiddleware = new ApiLoggingMiddleware();

export default apiLoggingMiddleware;