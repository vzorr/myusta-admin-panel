// Store logs for browser access
let proxyLogs = [];

const addLog = (type, message, data = null) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    message,
    data,
    id: Date.now() + Math.random()
  };
  proxyLogs.push(logEntry);
  
  // Keep only last 100 logs to prevent memory issues
  if (proxyLogs.length > 100) {
    proxyLogs = proxyLogs.slice(-100);
  }
  
  // Also log to console
  const emoji = type === 'error' ? '❌' : type === 'outgoing' ? '📤' : type === 'incoming' ? '📥' : '🔍';
  console.log(`${emoji} [${logEntry.timestamp}] ${message}`, data ? data : '');
};

const setupLoggerEndpoints = (app) => {
  console.log('🔍 Setting up debug logger endpoints...');
  
  // View logs endpoint - NOT under /api
  app.get('/_logs', (req, res) => {
    res.json({
      logs: proxyLogs,
      totalLogs: proxyLogs.length,
      timestamp: new Date().toISOString()
    });
  });

  // Clear logs endpoint - NOT under /api
  app.post('/_logs/clear', (req, res) => {
    proxyLogs = [];
    addLog('info', 'Proxy logs cleared');
    res.json({ message: 'Logs cleared', timestamp: new Date().toISOString() });
  });

  // Download logs endpoint - NOT under /api
  app.get('/_logs/download', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="proxy-logs.json"');
    res.json(proxyLogs);
  });

  // Test endpoint - still under /api for testing proxy
  app.get('/api/test-proxy', (req, res) => {
    addLog('test', 'Test proxy endpoint accessed');
    res.json({
      message: 'Proxy test endpoint working',
      timestamp: new Date().toISOString(),
      originalUrl: req.originalUrl,
      logsUrl: 'http://localhost:4000/_logs'
    });
  });

  console.log('✅ Logger endpoints setup complete:');
  console.log('   🔍 View logs: http://localhost:4000/_logs');
  console.log('   🧹 Clear logs: POST http://localhost:4000/_logs/clear');
  console.log('   💾 Download logs: http://localhost:4000/_logs/download');
  console.log('   🧪 Test endpoint: http://localhost:4000/api/test-proxy');
  console.log('   📋 Note: _logs endpoints are NOT under /api path');
};

const createLoggingMiddleware = () => {
  return (req, res, next) => {
    // Skip logging for test endpoint only (since _logs is no longer under /api)
    if (req.url === '/test-proxy') {
      return next();
    }
    
    const logData = {
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      path: req.path,
      query: req.query,
      ip: req.ip
    };
    
    addLog('request', `Incoming: ${req.method} ${req.originalUrl}`, logData);
    next();
  };
};

const createProxyEventHandlers = (target) => {
  return {
    onProxyReq: (proxyReq, req, res) => {
      const logData = {
        method: req.method,
        originalUrl: req.originalUrl,
        target: `${target}${req.originalUrl}`,
        headers: req.headers,
        userAgent: req.get('User-Agent'),
        contentType: req.get('Content-Type'),
        body: req.body
      };
      
      addLog('outgoing', `${req.method} ${req.originalUrl} → ${target}${req.originalUrl}`, logData);
    },
    
    onProxyRes: (proxyRes, req, res) => {
      const logData = {
        status: proxyRes.statusCode,
        statusMessage: proxyRes.statusMessage,
        url: req.originalUrl,
        method: req.method,
        responseHeaders: proxyRes.headers,
        contentType: proxyRes.headers['content-type'],
        contentLength: proxyRes.headers['content-length']
      };
      
      addLog('incoming', `${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`, logData);
    },
    
    onError: (err, req, res) => {
      const logData = {
        url: req.originalUrl,
        method: req.method,
        errorCode: err.code,
        errorMessage: err.message,
        stack: err.stack,
        target: target
      };
      
      addLog('error', `Proxy Error: ${err.message} for ${req.method} ${req.originalUrl}`, logData);
      
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Proxy Error',
          message: err.message,
          code: err.code,
          target: target,
          url: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
    }
  };
};

module.exports = {
  addLog,
  setupLoggerEndpoints,
  createLoggingMiddleware,
  createProxyEventHandlers
};