// src/components/debug/DebugPanel.jsx - Optional debug component
import React, { useState, useEffect } from 'react';
import middlewareManager, { apiLoggingMiddleware } from '../../middlewares';
import logger from '../../utils/logger';

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);

  // Update stats periodically
  useEffect(() => {
    const updateStats = () => {
      setStats(middlewareManager.getStatus());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleMiddleware = (name, enabled) => {
    middlewareManager.toggleMiddleware(name, enabled);
    setStats(middlewareManager.getStatus());
  };

  const clearLogs = () => {
    logger.info('Debug panel: Clearing console logs');
    console.clear();
  };

  const downloadLogs = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      stats: stats,
      systemInfo: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debug-logs-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const testApiCall = async () => {
    logger.info('Debug panel: Testing API call');
    try {
      // Make a test fetch call
      await fetch('/api/test-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-123456789'
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          debugData: {
            userName: 'Test User',
            password: 'test-password',
            sensitiveInfo: 'this-should-be-logged'
          }
        })
      });
    } catch (error) {
      logger.info('Test API call completed (expected to fail)');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 z-50"
        title="Open Debug Panel"
      >
        🔧
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md max-h-96 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Middleware Status */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Middleware Status</h4>
        <div className="space-y-2 text-sm">
          {stats.installed?.map((middleware) => (
            <div key={middleware} className="flex items-center justify-between">
              <span className="text-green-600">✓ {middleware}</span>
              <button
                onClick={() => toggleMiddleware(middleware, false)}
                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
              >
                Disable
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* API Stats */}
      {stats.apiStats && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">API Statistics</h4>
          <div className="text-sm space-y-1">
            <div>Total Requests: {stats.apiStats.totalRequests}</div>
            <div>Active Requests: {stats.apiStats.activeRequests}</div>
            <div>Installed: {stats.apiStats.installed ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="space-y-2">
        <button
          onClick={testApiCall}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700"
        >
          Test API Call
        </button>
        
        <button
          onClick={clearLogs}
          className="w-full bg-yellow-600 text-white py-2 px-4 rounded text-sm hover:bg-yellow-700"
        >
          Clear Console
        </button>
        
        <button
          onClick={downloadLogs}
          className="w-full bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700"
        >
          Download Debug Info
        </button>

        <button
          onClick={() => middlewareManager.logStatus()}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded text-sm hover:bg-purple-700"
        >
          Log Status to Console
        </button>
      </div>

      {/* Quick Settings */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
        <div className="space-y-1 text-sm">
          <button
            onClick={() => logger.separator('MANUAL DEBUG SEPARATOR')}
            className="block w-full text-left text-blue-600 hover:text-blue-800"
          >
            Add Log Separator
          </button>
          <button
            onClick={() => middlewareManager.logSystemInfo()}
            className="block w-full text-left text-blue-600 hover:text-blue-800"
          >
            Log System Info
          </button>
          <button
            onClick={() => console.table(stats)}
            className="block w-full text-left text-blue-600 hover:text-blue-800"
          >
            Table View Stats
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;