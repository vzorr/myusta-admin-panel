// src/setupProxy.js - Multi-backend proxy configuration
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('🔧 Setting up multi-backend proxy configuration...');
  /*
  // MyUsta Backend (port 3000) - handles /api/* routes (except /api/v1/*)
  const myustaProxy = createProxyMiddleware({
    target: 'http://127.0.0.1:3000',
    changeOrigin: true,
    pathFilter: (pathname, req) => {
      // Proxy /api/* routes but NOT /api/v1/* (those go to chat backend)
      const shouldProxy = pathname.startsWith('/api/') && !pathname.startsWith('/api/v1/');
      console.log(`[MyUsta] ${req.method} ${pathname} -> ${shouldProxy ? 'PROXY' : 'SKIP'}`);
      return shouldProxy;
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        console.log(`[MyUsta] Proxying: ${req.method} ${req.url} -> http://127.0.0.1:3000${req.url}`);
      },
      error: (err, req, res) => {
        console.log(`[MyUsta] ERROR: ${err.message} for ${req.method} ${req.url}`);
        if (!res.headersSent) {
          res.status(502).json({
            error: 'MyUsta Backend Error',
            message: 'Cannot connect to MyUsta backend server (port 3000)',
            details: err.message
          });
        }
      },
    },
  });

  // Chat Backend (port 5000) - handles /api/v1/* routes  
  const chatProxy = createProxyMiddleware({
    target: 'http://127.0.0.1:5000',
    changeOrigin: true,
    pathFilter: '/api/v1',
    on: {
      proxyReq: (proxyReq, req, res) => {
        console.log(`[Chat] Proxying: ${req.method} ${req.url} -> http://127.0.0.1:5000${req.url}`);
      },
      error: (err, req, res) => {
        console.log(`[Chat] ERROR: ${err.message} for ${req.method} ${req.url}`);
        if (!res.headersSent) {
          res.status(502).json({
            error: 'Chat Backend Error', 
            message: 'Cannot connect to Chat backend server (port 5000)',
            details: err.message
          });
        }
      },
    },
  });

  // Apply proxy middleware
  app.use(myustaProxy);  // This will handle /api/* (except /api/v1/*)
  app.use(chatProxy);    // This will handle /api/v1/*
  
  console.log('✅ Multi-backend proxy configuration complete:');
  console.log('   📱 MyUsta: /api/* (except /api/v1/*) -> http://127.0.0.1:3000');
  console.log('   💬 Chat:   /api/v1/* -> http://127.0.0.1:5000');
  console.log('');
  console.log('🎯 Route examples:');
  console.log('   /api/auth/login -> MyUsta (port 3000)');
  console.log('   /api/users -> MyUsta (port 3000)');
  console.log('   /api/v1/conversations -> Chat (port 5000)');
  console.log('   /api/v1/messages -> Chat (port 5000)');

  */
};