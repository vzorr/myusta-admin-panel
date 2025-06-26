// src/utils/logger.js - Simplified to reduce console spam
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isDebugEnabled = process.env.REACT_APP_DEBUG === 'true' || this.isDevelopment;
    this.requestCounter = 0;
    this.lastLogTime = {};
    this.logThrottleMs = 1000; // Throttle repeated logs
  }

  // Check if we should throttle this log
  shouldThrottle(key) {
    const now = Date.now();
    const lastTime = this.lastLogTime[key] || 0;
    
    if (now - lastTime < this.logThrottleMs) {
      return true; // Throttle this log
    }
    
    this.lastLogTime[key] = now;
    return false;
  }

  // Simple console operations with error handling and throttling
  log(level, message, data = null, context = '') {
    if (!this.isDebugEnabled) return;

    const logKey = `${level}-${message}`;
    if (this.shouldThrottle(logKey)) return;

    try {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      const contextStr = context ? ` [${context}]` : '';
      
      if (data !== null) {
        console.log(`${level}${contextStr} ${timestamp}: ${message}`, data);
      } else {
        console.log(`${level}${contextStr} ${timestamp}: ${message}`);
      }
    } catch (error) {
      console.log(`${level}: ${message}`, data);
    }
  }

  info(message, data = null, context = '') {
    this.log('ℹ️ INFO', message, data, context);
  }

  success(message, data = null, context = '') {
    this.log('✅ SUCCESS', message, data, context);
  }

  warn(message, data = null, context = '') {
    this.log('⚠️ WARN', message, data, context);
  }

  error(message, data = null, context = '') {
    // Don't throttle errors
    if (!this.isDebugEnabled) return;

    try {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      const contextStr = context ? ` [${context}]` : '';
      console.error(`❌ ERROR${contextStr} ${timestamp}: ${message}`, data);
    } catch (error) {
      console.error(`ERROR: ${message}`, data);
    }
  }

  debug(message, data = null, context = '') {
    this.log('🔍 DEBUG', message, data, context);
  }

  api(message, data = null, context = '') {
    this.log('🌐 API', message, data, context);
  }

  auth(message, data = null, context = '') {
    this.log('🔐 AUTH', message, data, context);
  }

  table(message, data = null, context = '') {
    this.log('📊 TABLE', message, data, context);
  }

  // Simplified API logging
  apiRequest(method, url, config = {}) {
    if (!this.isDebugEnabled) return;
    
    this.requestCounter++;
    const requestId = `REQ-${this.requestCounter.toString().padStart(4, '0')}`;
    
    console.log(`🚀 [${requestId}] ${method} ${url}`);
    
    if (config.body) {
      try {
        const parsedBody = JSON.parse(config.body);
        console.log(`📦 Body:`, parsedBody);
      } catch (e) {
        console.log(`📦 Body:`, config.body);
      }
    }
    
    return requestId;
  }

  apiResponse(status, data, url, requestId = null) {
    if (!this.isDebugEnabled) return;
    
    const emoji = status >= 200 && status < 300 ? '✅' : '❌';
    const idStr = requestId ? ` [${requestId}]` : '';
    
    console.log(`${emoji}${idStr} ${status} - ${url}`);
    
    if (data && typeof data === 'object') {
      console.log(`📦 Response:`, data);
    }
  }

  apiError(error, url, config = {}, requestId = null) {
    if (!this.isDebugEnabled) return;
    
    const idStr = requestId ? ` [${requestId}]` : '';
    console.error(`💥 ERROR${idStr}: ${error.message} - ${url}`);
  }

  authAction(action, credentials = {}, response = {}) {
    if (!this.isDebugEnabled) return;
    
    console.log(`🔐 AUTH: ${action}`);
    
    if (response.token) {
      console.log(`🎟️ Token received (${response.token.length} chars)`);
    }
  }

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

  separator(title = '', context = '') {
    if (!this.isDebugEnabled) return;
    
    const line = '='.repeat(60);
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    
    console.log(`${line}`);
    if (title) {
      const fullTitle = context ? `${title} [${context}]` : title;
      console.log(`${fullTitle} - ${timestamp}`);
      console.log(`${line}`);
    }
  }

  // Simplified storage logging
  storageAction(action, key, value = null) {
    if (!this.isDebugEnabled) return;
    
    const logKey = `storage-${action}-${key}`;
    if (this.shouldThrottle(logKey)) return;
    
    console.log(`💾 STORAGE ${action}: ${key}`);
  }

  // Simplified DB logging
  dbOperation(operation, table, data = {}) {
    if (!this.isDebugEnabled) return;
    
    console.log(`🗄️ DB ${operation}: ${table}`);
  }
}

export default new Logger();