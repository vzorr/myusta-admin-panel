// src/middlewares/index.js - Simplified and disabled logging middlewares
import logger from '../utils/logger';

class MiddlewareManager {
  constructor() {
    this.installedMiddlewares = new Set();
    this.config = {
      enableApiLogging: false, // DISABLED to prevent spam
      enableStorageLogging: false, // DISABLED to prevent spam
      enableConsoleLogging: false, // DISABLED to prevent spam
      logLevel: process.env.REACT_APP_LOG_LEVEL || 'error' // Only errors
    };
  }

  // Install minimal middlewares only
  installAll() {
    logger.separator('INSTALLING MIDDLEWARES', 'STARTUP');
    
    try {
      // Only install error tracking - disable all logging middlewares
      this.installErrorTracking();
      this.installedMiddlewares.add('errorTracking');
      logger.success('Error Tracking Middleware installed');

      logger.success('Minimal middlewares installed successfully', {
        installed: Array.from(this.installedMiddlewares),
        config: this.config
      });

    } catch (error) {
      logger.error('Failed to install middlewares', error);
    }
  }

  // Install only global error tracking
  installErrorTracking() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    });

    // Global errors
    window.addEventListener('error', (event) => {
      console.error('Global Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }

  // Uninstall all middlewares
  uninstallAll() {
    logger.info('Uninstalling all middlewares');
    this.installedMiddlewares.clear();
  }

  // Get status of all middlewares
  getStatus() {
    return {
      installed: Array.from(this.installedMiddlewares),
      config: this.config,
      timestamp: new Date().toISOString()
    };
  }

  // Log current status
  logStatus() {
    const status = this.getStatus();
    logger.info('Middleware Status', status);
    return status;
  }

  // Log minimal system info
  logSystemInfo() {
    const systemInfo = {
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent.substring(0, 100) + '...'
    };

    logger.info('System Information', systemInfo);
  }

  // Enable/disable specific middleware (minimal implementation)
  toggleMiddleware(name, enabled) {
    logger.info(`${enabled ? 'Enabling' : 'Disabling'} middleware: ${name}`);
    // No-op for now since all logging is disabled
  }
}

// Create singleton instance
const middlewareManager = new MiddlewareManager();

export default middlewareManager;