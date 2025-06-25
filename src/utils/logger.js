// src/utils/logger.js
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isDebugEnabled = process.env.REACT_APP_DEBUG === 'true' || this.isDevelopment;
  }

  // Pretty format objects for logging
  formatObject(obj) {
    return JSON.stringify(obj, null, 2);
  }

  // Create styled console output
  createStyledLog(level, color, bgColor = '') {
    return (message, data = null, context = '') => {
      if (!this.isDebugEnabled) return;

      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      const contextStr = context ? ` [${context}]` : '';
      
      const styles = [
        `color: ${color}`,
        `font-weight: bold`,
        bgColor && `background: ${bgColor}`,
        'padding: 2px 6px',
        'border-radius: 3px'
      ].filter(Boolean).join('; ');

      console.group(`%c${level}${contextStr} ${timestamp}`, styles);
      console.log(message);
      
      if (data !== null) {
        if (typeof data === 'object') {
          console.log('📊 Data:', this.formatObject(data));
        } else {
          console.log('📊 Data:', data);
        }
      }
      
      console.groupEnd();
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

  // Special method for API requests
  apiRequest(method, url, config = {}) {
    if (!this.isDebugEnabled) return;
    
    console.group(`🚀 API REQUEST: ${method} ${url}`);
    console.log('🔗 URL:', url);
    console.log('⚙️ Config:', this.formatObject({
      ...config,
      headers: {
        ...config.headers,
        // Mask authorization header for security
        ...(config.headers?.Authorization && {
          Authorization: 'Bearer [MASKED]'
        })
      }
    }));
    console.groupEnd();
  }

  // Special method for API responses
  apiResponse(status, data, url) {
    if (!this.isDebugEnabled) return;
    
    const isSuccess = status >= 200 && status < 300;
    const emoji = isSuccess ? '✅' : '❌';
    const color = isSuccess ? '#4CAF50' : '#F44336';
    
    console.group(`%c${emoji} API RESPONSE: ${status}`, `color: ${color}; font-weight: bold;`);
    console.log('🔗 URL:', url);
    console.log('📊 Status:', status);
    console.log('📦 Data:', this.formatObject(data));
    console.groupEnd();
  }

  // Method to log performance
  time(label) {
    if (this.isDebugEnabled) {
      console.time(`⏱️ ${label}`);
    }
  }

  timeEnd(label) {
    if (this.isDebugEnabled) {
      console.timeEnd(`⏱️ ${label}`);
    }
  }

  // Method to create a separator in logs
  separator(title = '') {
    if (!this.isDebugEnabled) return;
    
    const line = '='.repeat(50);
    console.log(`%c${line}`, 'color: #666; font-weight: bold;');
    if (title) {
      console.log(`%c${title}`, 'color: #333; font-weight: bold; font-size: 14px;');
      console.log(`%c${line}`, 'color: #666; font-weight: bold;');
    }
  }
}

export default new Logger();