// src/setupProxy.js

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('🔧 Setting up API proxies...');
  
  // MyUsta backend proxy (localhost:3000) - handles /api/admin, /api/auth, etc.
  app.use(
    '/api/',
    createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: {
        '^/api/myusta': '', // Remove /api/myusta prefix, keeps /api/admin
      },
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log(`📤 MyUsta: ${req.method} ${req.url} → http://localhost:3000${proxyReq.path}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`📥 MyUsta: ${proxyRes.statusCode} ${req.url}`);
      },
      onError: (err, req, res) => {
        console.error('❌ MyUsta Proxy Error:', err.message);
        res.status(500).send(`MyUsta Backend Error: ${err.message}`);
      }
    })
  );

  // Chat backend proxy (localhost:5000) - handles /api/v1/admin, /api/v1/*, etc.
  app.use(
    '/api/v1/',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api/chat': '', // Remove /api/chat prefix, keeps /api/v1/admin
      },
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log(`📤 Chat: ${req.method} ${req.url} → http://localhost:5000${proxyReq.path}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`📥 Chat: ${proxyRes.statusCode} ${req.url}`);
      },
      onError: (err, req, res) => {
        console.error('❌ Chat Proxy Error:', err.message);
        res.status(500).send(`Chat Backend Error: ${err.message}`);
      }
    })
  );

  console.log('✅ Proxy setup complete:');
  console.log('  /api/myusta/* → http://localhost:3000/*');
  console.log('  /api/chat/* → http://localhost:5000/*');
};