// src/middleware/index.js - Centralized middleware setup
import apiLoggingMiddleware from './apiLoggingMiddleware';
import logger from '../utils/logger';

class MiddlewareManager {
  constructor() {
    this.installedMiddlewares = new Set();
    this.config = {
      enableApiLogging: process.env.REACT_APP_ENABLE_API_LOGGING !== 'false',
      enableStorageLogging: process.env.REACT_APP_ENABLE_STORAGE_LOGGING !== 'false',
      enableConsoleLogging: process.env.REACT_APP_ENABLE_CONSOLE_LOGGING !== 'false',
      logLevel: process.env.REACT_APP_LOG_LEVEL || 'debug'
    };
  }

  // Install all middlewares
  installAll() {
    logger.separator('INSTALLING MIDDLEWARES', 'STARTUP');
    
    try {
      // Install API logging middleware
      if (this.config.enableApiLogging && false) { // Simple disable with && false
        apiLoggingMiddleware.install();
        this.installedMiddlewares.add('apiLogging');
        logger.success('API Logging Middleware installed');
      }

      // Install localStorage logging middleware
      if (this.config.enableStorageLogging) {
        this.installStorageLogging();
        this.installedMiddlewares.add('storageLogging');
        logger.success('Storage Logging Middleware installed');
      }

      // Install console logging middleware
      if (this.config.enableConsoleLogging) {
        this.installConsoleLogging();
        this.installedMiddlewares.add('consoleLogging');
        logger.success('Console Logging Middleware installed');
      }

      // Install error boundary middleware
      this.installErrorTracking();
      this.installedMiddlewares.add('errorTracking');
      logger.success('Error Tracking Middleware installed');

      logger.success('All middlewares installed successfully', {
        installed: Array.from(this.installedMiddlewares),
        config: this.config
      });

      // Log system information
      this.logSystemInfo();

    } catch (error) {
      logger.error('Failed to install middlewares', error);
    }
  }

  // Install localStorage/sessionStorage logging
  installStorageLogging() {
    // Monkey patch localStorage
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;

    localStorage.setItem = function(key, value) {
      logger.storageAction('SET', key, value);
      return originalSetItem.call(this, key, value);
    };

    localStorage.getItem = function(key) {
      const value = originalGetItem.call(this, key);
      logger.storageAction('GET', key, value);
      return value;
    };

    localStorage.removeItem = function(key) {
      logger.storageAction('REMOVE', key);
      return originalRemoveItem.call(this, key);
    };

    localStorage.clear = function() {
      logger.storageAction('CLEAR', 'ALL_KEYS');
      return originalClear.call(this);
    };

    // Monkey patch sessionStorage
    const originalSessionSetItem = sessionStorage.setItem;
    const originalSessionGetItem = sessionStorage.getItem;
    const originalSessionRemoveItem = sessionStorage.removeItem;
    const originalSessionClear = sessionStorage.clear;

    sessionStorage.setItem = function(key, value) {
      logger.storageAction('SESSION_SET', key, value);
      return originalSessionSetItem.call(this, key, value);
    };

    sessionStorage.getItem = function(key) {
      const value = originalSessionGetItem.call(this, key);
      logger.storageAction('SESSION_GET', key, value);
      return value;
    };

    sessionStorage.removeItem = function(key) {
      logger.storageAction('SESSION_REMOVE', key);
      return originalSessionRemoveItem.call(this, key);
    };

    sessionStorage.clear = function() {
      logger.storageAction('SESSION_CLEAR', 'ALL_KEYS');
      return originalSessionClear.call(this);
    };
  }

  // Install console logging enhancement
  installConsoleLogging() {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;

    console.error = function(...args) {
      logger.error('Console Error', {
        arguments: args,
        stack: new Error().stack,
        timestamp: new Date().toISOString()
      });
      return originalConsoleError.apply(this, args);
    };

    console.warn = function(...args) {
      logger.warn('Console Warning', {
        arguments: args,
        timestamp: new Date().toISOString()
      });
      return originalConsoleWarn.apply(this, args);
    };

    // Optionally enhance console.log
    if (process.env.REACT_APP_LOG_ALL_CONSOLE === 'true') {
      console.log = function(...args) {
        logger.debug('Console Log', {
          arguments: args,
          timestamp: new Date().toISOString()
        });
        return originalConsoleLog.apply(this, args);
      };
    }
  }

  // Install global error tracking
  installErrorTracking() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Global errors
    window.addEventListener('error', (event) => {
      logger.error('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // React error boundary integration
    window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ || {};
    const originalCaptureException = window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__.captureException;
    
    if (originalCaptureException) {
      window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__.captureException = function(error) {
        logger.error('React Error Boundary', {
          error: error,
          message: error.message,
          stack: error.stack,
          componentStack: error.componentStack,
          timestamp: new Date().toISOString()
        });
        return originalCaptureException.call(this, error);
      };
    }
  }

  // Log comprehensive system information
  logSystemInfo() {
    const systemInfo = {
      // Browser info
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      onLine: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      
      // Screen info
      screenWidth: typeof window !== 'undefined' && window.screen ? window.screen.width : 'Unknown',
      screenHeight: typeof window !== 'undefined' && window.screen ? window.screen.height : 'Unknown',
      colorDepth: typeof window !== 'undefined' && window.screen ? window.screen.colorDepth : 'Unknown',
      pixelDepth: typeof window !== 'undefined' && window.screen ? window.screen.pixelDepth : 'Unknown',
      
      // Window info
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      
      // Performance info
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      
      // App info
      nodeEnv: process.env.NODE_ENV,
      reactVersion: this.getReactVersion(),
      buildTime: process.env.REACT_APP_BUILD_TIME || 'Unknown',
      
      // URL info
      currentUrl: window.location.href,
      origin: window.location.origin,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      
      // Storage info
      localStorageSupported: typeof Storage !== 'undefined',
      sessionStorageSupported: typeof sessionStorage !== 'undefined',
      
      // Date/Time
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      // Memory (if available)
      memory: this.getMemoryInfo()
    };

    logger.separator('SYSTEM INFORMATION', 'STARTUP');
    console.table(systemInfo);
    logger.info('Complete System Information', systemInfo);
  }

  // Helper method to get React version safely
  getReactVersion() {
    try {
      // Try to get React version from window object or require
      if (typeof window !== 'undefined' && window.React) {
        return window.React.version;
      }
      // Fallback to checking if React is available globally
      return 'Available (version unknown)';
    } catch (error) {
      return 'Unknown';
    }
  }

  // Helper method to get memory info safely
  getMemoryInfo() {
    try {
      if (performance && performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
      return 'Not available';
    } catch (error) {
      return 'Error accessing memory info';
    }
  }

  // Uninstall all middlewares
  uninstallAll() {
    logger.info('Uninstalling all middlewares');
    
    // Uninstall API logging
    if (this.installedMiddlewares.has('apiLogging')) {
      apiLoggingMiddleware.uninstall();
      this.installedMiddlewares.delete('apiLogging');
    }

    // Note: Storage and console logging can't be easily uninstalled
    // as we would need to store references to original functions
    
    logger.info('Middlewares uninstalled', {
      remaining: Array.from(this.installedMiddlewares)
    });
  }

  // Get status of all middlewares
  getStatus() {
    return {
      installed: Array.from(this.installedMiddlewares),
      config: this.config,
      apiStats: apiLoggingMiddleware.getStats(),
      timestamp: new Date().toISOString()
    };
  }

  // Log current status
  logStatus() {
    const status = this.getStatus();
    logger.info('Middleware Status', status);
    return status;
  }

  // Enable/disable specific middleware
  toggleMiddleware(name, enabled) {
    logger.info(`${enabled ? 'Enabling' : 'Disabling'} middleware: ${name}`);
    
    switch (name) {
      case 'apiLogging':
        if (enabled && !this.installedMiddlewares.has('apiLogging')) {
          apiLoggingMiddleware.install();
          this.installedMiddlewares.add('apiLogging');
        } else if (!enabled && this.installedMiddlewares.has('apiLogging')) {
          apiLoggingMiddleware.uninstall();
          this.installedMiddlewares.delete('apiLogging');
        }
        break;
      default:
        logger.warn(`Unknown middleware: ${name}`);
    }
  }
}

// Create singleton instance
const middlewareManager = new MiddlewareManager();

export default middlewareManager;

// Export individual middlewares for direct access
export { apiLoggingMiddleware };