// src/utils/logger.js - Fixed with proper error handling
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isDebugEnabled = process.env.REACT_APP_DEBUG === 'true' || this.isDevelopment;
    this.requestCounter = 0;
  }

  // Pretty format objects for logging
  formatObject(obj) {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      return String(obj);
    }
  }

  // Safe console operations with error handling
  safeConsoleOperation(operation, ...args) {
    try {
      if (typeof console[operation] === 'function') {
        console[operation](...args);
      } else {
        console.log(...args);
      }
    } catch (error) {
      // Fallback to basic console.log if operation fails
      try {
        console.log('Logger Error:', error.message, ...args);
      } catch (fallbackError) {
        // If even console.log fails, fail silently
      }
    }
  }

  // Create styled console output with error handling
  createStyledLog(level, color, bgColor = '') {
    return (message, data = null, context = '') => {
      if (!this.isDebugEnabled) return;

      try {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const contextStr = context ? ` [${context}]` : '';
        
        const styles = [
          `color: ${color}`,
          `font-weight: bold`,
          bgColor && `background: ${bgColor}`,
          'padding: 2px 6px',
          'border-radius: 3px'
        ].filter(Boolean).join('; ');

        this.safeConsoleOperation('group', `%c${level}${contextStr} ${timestamp}`, styles);
        this.safeConsoleOperation('log', message);
        
        if (data !== null) {
          if (typeof data === 'object') {
            this.safeConsoleOperation('log', '📊 Data:', this.formatObject(data));
          } else {
            this.safeConsoleOperation('log', '📊 Data:', data);
          }
        }
        
        this.safeConsoleOperation('groupEnd');
      } catch (error) {
        // Fallback logging
        this.safeConsoleOperation('log', `${level}: ${message}`, data);
      }
    };
  }

  // Different log levels with colors
  info = this.createStyledLog('ℹ️ INFO', '#2196F3');
  success = this.createStyledLog('✅ SUCCESS', '#4CAF50');
  warn = this.createStyledLog('⚠️ WARN', '#FF9800');
  error = this.createStyledLog('❌ ERROR', '#F44336');
  debug = this.createStyledLog('🔍 DEBUG', '#9C27B0');
  api = this.createStyledLog('🌐 API', '#00BCD4');
  auth = this.createStyledLog('🔐 AUTH', '#FF5722');
  table = this.createStyledLog('📊 TABLE', '#607D8B');

  // Enhanced API request logging with full details
  apiRequest(method, url, config = {}) {
    if (!this.isDebugEnabled) return;
    
    try {
      this.requestCounter++;
      const requestId = `REQ-${this.requestCounter.toString().padStart(4, '0')}`;
      const timestamp = new Date().toISOString();
      
      this.safeConsoleOperation('group', `%c🚀 API REQUEST [${requestId}] ${method} ${url}`, 
        'color: #2196F3; font-weight: bold; font-size: 12px;');
      
      this.safeConsoleOperation('log', `%c⏰ Timestamp:`, 'color: #666; font-weight: bold;', timestamp);
      this.safeConsoleOperation('log', `%c🔗 Full URL:`, 'color: #666; font-weight: bold;', url);
      this.safeConsoleOperation('log', `%c📤 Method:`, 'color: #666; font-weight: bold;', method);
      
      // Log headers with full details (no masking)
      if (config.headers) {
        this.safeConsoleOperation('log', `%c📋 Headers:`, 'color: #666; font-weight: bold;');
        this.safeConsoleOperation('table', config.headers);
        this.safeConsoleOperation('log', 'Raw Headers:', this.formatObject(config.headers));
      }
      
      // Log request body/payload with full details
      if (config.body) {
        this.safeConsoleOperation('log', `%c📦 Request Payload:`, 'color: #666; font-weight: bold;');
        try {
          const parsedBody = JSON.parse(config.body);
          this.safeConsoleOperation('table', parsedBody);
          this.safeConsoleOperation('log', 'Raw Payload:', this.formatObject(parsedBody));
        } catch (e) {
          this.safeConsoleOperation('log', 'Raw Body (non-JSON):', config.body);
        }
      }
      
      // Log other config options
      const configWithoutBody = { ...config };
      delete configWithoutBody.body;
      delete configWithoutBody.headers;
      
      if (Object.keys(configWithoutBody).length > 0) {
        this.safeConsoleOperation('log', `%c⚙️ Other Config:`, 'color: #666; font-weight: bold;');
        this.safeConsoleOperation('log', this.formatObject(configWithoutBody));
      }
      
      this.safeConsoleOperation('groupEnd');
      
      // Store request ID for response matching
      return requestId;
    } catch (error) {
      this.safeConsoleOperation('log', 'Logger Error in apiRequest:', error.message);
      return 'REQ-ERROR';
    }
  }

  // Enhanced API response logging with full details
  apiResponse(status, data, url, requestId = null, headers = null, duration = null) {
    if (!this.isDebugEnabled) return;
    
    try {
      const isSuccess = status >= 200 && status < 300;
      const emoji = isSuccess ? '✅' : '❌';
      const color = isSuccess ? '#4CAF50' : '#F44336';
      const timestamp = new Date().toISOString();
      
      const requestIdStr = requestId ? ` [${requestId}]` : '';
      
      this.safeConsoleOperation('group', `%c${emoji} API RESPONSE${requestIdStr} ${status}`, 
        `color: ${color}; font-weight: bold; font-size: 12px;`);
      
      this.safeConsoleOperation('log', `%c⏰ Timestamp:`, 'color: #666; font-weight: bold;', timestamp);
      this.safeConsoleOperation('log', `%c🔗 URL:`, 'color: #666; font-weight: bold;', url);
      this.safeConsoleOperation('log', `%c📊 Status:`, 'color: #666; font-weight: bold;', status);
      
      if (duration !== null) {
        this.safeConsoleOperation('log', `%c⚡ Duration:`, 'color: #666; font-weight: bold;', `${duration}ms`);
      }
      
      // Log response headers
      if (headers) {
        this.safeConsoleOperation('log', `%c📋 Response Headers:`, 'color: #666; font-weight: bold;');
        const headersObj = {};
        try {
          if (headers.entries) {
            for (let [key, value] of headers.entries()) {
              headersObj[key] = value;
            }
            this.safeConsoleOperation('table', headersObj);
          }
          this.safeConsoleOperation('log', 'Raw Headers:', headersObj);
        } catch (headerError) {
          this.safeConsoleOperation('log', 'Headers (fallback):', headers);
        }
      }
      
      // Log response data with full details
      this.safeConsoleOperation('log', `%c📦 Response Data:`, 'color: #666; font-weight: bold;');
      if (typeof data === 'object' && data !== null) {
        // Create a flattened view for table display
        try {
          if (Array.isArray(data)) {
            this.safeConsoleOperation('log', `Array with ${data.length} items:`);
            if (data.length > 0 && data.length <= 10) {
              this.safeConsoleOperation('table', data);
            }
          } else {
            this.safeConsoleOperation('table', data);
          }
        } catch (e) {
          // Fallback if table display fails
          this.safeConsoleOperation('log', 'Table display failed, showing raw data');
        }
        this.safeConsoleOperation('log', 'Raw Response:', this.formatObject(data));
      } else {
        this.safeConsoleOperation('log', 'Response Value:', data);
      }
      
      // Log response analysis
      if (typeof data === 'object' && data !== null) {
        try {
          const analysis = {
            type: Array.isArray(data) ? 'Array' : 'Object',
            size: Array.isArray(data) ? data.length : Object.keys(data).length,
            keys: Array.isArray(data) ? 'N/A' : Object.keys(data).join(', '),
            hasErrors: data.error || data.errors ? 'Yes' : 'No',
            success: data.success !== undefined ? String(data.success) : 'N/A'
          };
          this.safeConsoleOperation('log', `%c📈 Response Analysis:`, 'color: #666; font-weight: bold;');
          this.safeConsoleOperation('table', analysis);
        } catch (analysisError) {
          this.safeConsoleOperation('log', 'Response analysis failed:', analysisError.message);
        }
      }
      
      this.safeConsoleOperation('groupEnd');
    } catch (error) {
      this.safeConsoleOperation('log', 'Logger Error in apiResponse:', error.message);
    }
  }

  // Enhanced error logging with full context
  apiError(error, url, config = {}, requestId = null) {
    if (!this.isDebugEnabled) return;
    
    try {
      const timestamp = new Date().toISOString();
      const requestIdStr = requestId ? ` [${requestId}]` : '';
      
      this.safeConsoleOperation('group', `%c💥 API ERROR${requestIdStr}`, 
        'color: #F44336; font-weight: bold; font-size: 12px; background: #ffebee; padding: 2px 6px;');
      
      this.safeConsoleOperation('log', `%c⏰ Timestamp:`, 'color: #666; font-weight: bold;', timestamp);
      this.safeConsoleOperation('log', `%c🔗 URL:`, 'color: #666; font-weight: bold;', url);
      this.safeConsoleOperation('log', `%c❌ Error Message:`, 'color: #666; font-weight: bold;', error.message);
      this.safeConsoleOperation('log', `%c🏷️ Error Type:`, 'color: #666; font-weight: bold;', error.name);
      
      if (error.status || error.statusCode) {
        this.safeConsoleOperation('log', `%c📊 Status Code:`, 'color: #666; font-weight: bold;', error.status || error.statusCode);
      }
      
      // Log the original request config that failed
      this.safeConsoleOperation('log', `%c🔄 Failed Request Config:`, 'color: #666; font-weight: bold;');
      this.safeConsoleOperation('log', this.formatObject(config));
      
      // Log full error object
      this.safeConsoleOperation('log', `%c🐛 Full Error Object:`, 'color: #666; font-weight: bold;');
      this.safeConsoleOperation('log', this.formatObject({
        name: error.name,
        message: error.message,
        stack: error.stack,
        status: error.status,
        statusCode: error.statusCode,
        code: error.code,
        cause: error.cause
      }));
      
      // Log stack trace
      if (error.stack) {
        this.safeConsoleOperation('log', `%c📚 Stack Trace:`, 'color: #666; font-weight: bold;');
        this.safeConsoleOperation('log', error.stack);
      }
      
      this.safeConsoleOperation('groupEnd');
    } catch (logError) {
      this.safeConsoleOperation('log', 'Logger Error in apiError:', logError.message, error);
    }
  }

  // Enhanced auth logging with full credentials
  authAction(action, credentials = {}, response = {}) {
    if (!this.isDebugEnabled) return;
    
    try {
      const timestamp = new Date().toISOString();
      
      this.safeConsoleOperation('group', `%c🔐 AUTH ACTION: ${action}`, 
        'color: #FF5722; font-weight: bold; font-size: 12px;');
      
      this.safeConsoleOperation('log', `%c⏰ Timestamp:`, 'color: #666; font-weight: bold;', timestamp);
      
      // Log credentials with full details (no masking for debugging)
      if (Object.keys(credentials).length > 0) {
        this.safeConsoleOperation('log', `%c🎫 Credentials:`, 'color: #666; font-weight: bold;');
        this.safeConsoleOperation('table', credentials);
        this.safeConsoleOperation('log', 'Raw Credentials:', this.formatObject(credentials));
      }
      
      // Log auth response with full details
      if (Object.keys(response).length > 0) {
        this.safeConsoleOperation('log', `%c📄 Auth Response:`, 'color: #666; font-weight: bold;');
        if (response.token) {
          this.safeConsoleOperation('log', `%c🎟️ Token:`, 'color: #666; font-weight: bold;', response.token);
          this.safeConsoleOperation('log', `%c📏 Token Length:`, 'color: #666; font-weight: bold;', response.token.length);
          
          // Try to decode JWT payload for debugging
          try {
            const parts = response.token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              this.safeConsoleOperation('log', `%c🔍 Token Payload:`, 'color: #666; font-weight: bold;');
              this.safeConsoleOperation('table', payload);
            }
          } catch (e) {
            this.safeConsoleOperation('log', 'Could not decode token payload');
          }
        }
        this.safeConsoleOperation('log', 'Full Auth Response:', this.formatObject(response));
      }
      
      this.safeConsoleOperation('groupEnd');
    } catch (error) {
      this.safeConsoleOperation('log', 'Logger Error in authAction:', error.message);
    }
  }

  // Method to log performance with more details
  time(label) {
    if (this.isDebugEnabled) {
      try {
        console.time(`⏱️ ${label}`);
        this.debug(`Started timing: ${label}`);
      } catch (error) {
        this.safeConsoleOperation('log', `Started timing: ${label}`);
      }
    }
  }

  timeEnd(label) {
    if (this.isDebugEnabled) {
      try {
        console.timeEnd(`⏱️ ${label}`);
        this.debug(`Finished timing: ${label}`);
      } catch (error) {
        this.safeConsoleOperation('log', `Finished timing: ${label}`);
      }
    }
  }

  // Enhanced separator with more context
  separator(title = '', context = '') {
    if (!this.isDebugEnabled) return;
    
    try {
      const line = '='.repeat(60);
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      
      this.safeConsoleOperation('log', `%c${line}`, 'color: #666; font-weight: bold;');
      if (title) {
        const fullTitle = context ? `${title} [${context}]` : title;
        this.safeConsoleOperation('log', `%c${fullTitle} - ${timestamp}`, 'color: #333; font-weight: bold; font-size: 16px;');
        this.safeConsoleOperation('log', `%c${line}`, 'color: #666; font-weight: bold;');
      }
    } catch (error) {
      this.safeConsoleOperation('log', `=== ${title} ${context} ===`);
    }
  }

  // Log all localStorage operations
  storageAction(action, key, value = null) {
    if (!this.isDebugEnabled) return;
    
    try {
      this.safeConsoleOperation('group', `%c💾 STORAGE ${action.toUpperCase()}: ${key}`, 
        'color: #9C27B0; font-weight: bold;');
      
      this.safeConsoleOperation('log', `%c🔑 Key:`, 'color: #666; font-weight: bold;', key);
      
      if (value !== null) {
        this.safeConsoleOperation('log', `%c📦 Value:`, 'color: #666; font-weight: bold;');
        if (typeof value === 'string' && value.length > 100) {
          this.safeConsoleOperation('log', 'Value (truncated):', value.substring(0, 100) + '...');
          this.safeConsoleOperation('log', 'Full Value:', value);
        } else {
          this.safeConsoleOperation('log', value);
        }
      }
      
      // Show current localStorage state
      this.safeConsoleOperation('log', `%c📚 Current localStorage:`, 'color: #666; font-weight: bold;');
      try {
        const storageContents = {};
        for (let i = 0; i < localStorage.length; i++) {
          const storageKey = localStorage.key(i);
          storageContents[storageKey] = localStorage.getItem(storageKey);
        }
        this.safeConsoleOperation('table', storageContents);
      } catch (storageError) {
        this.safeConsoleOperation('log', 'Could not read localStorage contents');
      }
      
      this.safeConsoleOperation('groupEnd');
    } catch (error) {
      this.safeConsoleOperation('log', `Storage ${action}: ${key}`, value);
    }
  }

  // Log database operations with full context
  dbOperation(operation, table, data = {}, conditions = {}) {
    if (!this.isDebugEnabled) return;
    
    try {
      this.safeConsoleOperation('group', `%c🗄️ DB ${operation.toUpperCase()}: ${table}`, 
        'color: #607D8B; font-weight: bold;');
      
      this.safeConsoleOperation('log', `%c📊 Table:`, 'color: #666; font-weight: bold;', table);
      this.safeConsoleOperation('log', `%c⚡ Operation:`, 'color: #666; font-weight: bold;', operation);
      
      if (Object.keys(data).length > 0) {
        this.safeConsoleOperation('log', `%c📦 Data:`, 'color: #666; font-weight: bold;');
        this.safeConsoleOperation('table', data);
        this.safeConsoleOperation('log', 'Raw Data:', this.formatObject(data));
      }
      
      if (Object.keys(conditions).length > 0) {
        this.safeConsoleOperation('log', `%c🔍 Conditions:`, 'color: #666; font-weight: bold;');
        this.safeConsoleOperation('table', conditions);
      }
      
      this.safeConsoleOperation('groupEnd');
    } catch (error) {
      this.safeConsoleOperation('log', `DB ${operation} on ${table}:`, data, conditions);
    }
  }
}

export default new Logger();