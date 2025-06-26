import React, { useState, useEffect } from 'react';

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/_logs');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      await fetch('/_logs/clear', { method: 'POST' });
      setLogs([]);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const downloadLogs = () => {
    window.open('/_logs/download', '_blank');
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getLogColor = (type) => {
    switch (type) {
      case 'error': return '#ff4444';
      case 'outgoing': return '#4CAF50';
      case 'incoming': return '#2196F3';
      case 'request': return '#FF9800';
      default: return '#666';
    }
  };

  const getLogEmoji = (type) => {
    switch (type) {
      case 'error': return '❌';
      case 'outgoing': return '📤';
      case 'incoming': return '📥';
      case 'request': return '🌐';
      case 'router': return '🔀';
      case 'test': return '🧪';
      default: return '🔍';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔍 Proxy Debug Logs</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>
        React Dev Server: http://localhost:4000 → Backend: http://localhost:3000
      </p>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={fetchLogs} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Logs'}
        </button>
        <button onClick={clearLogs} style={{ marginLeft: '10px' }}>
          Clear Logs
        </button>
        <button onClick={downloadLogs} style={{ marginLeft: '10px' }}>
          Download Logs
        </button>
        <label style={{ marginLeft: '20px' }}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh (2s)
        </label>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Total Logs: {logs.length}</strong>
      </div>

      <div style={{ 
        height: '600px', 
        overflow: 'auto', 
        border: '1px solid #ccc', 
        backgroundColor: '#f9f9f9',
        padding: '10px'
      }}>
        {logs.length === 0 ? (
          <div>No logs yet. Make some API calls to see them here!</div>
        ) : (
          logs.slice().reverse().map((log, index) => (
            <div 
              key={log.id || index} 
              style={{ 
                marginBottom: '10px', 
                padding: '8px', 
                borderLeft: `4px solid ${getLogColor(log.type)}`,
                backgroundColor: 'white',
                fontSize: '12px'
              }}
            >
              <div style={{ fontWeight: 'bold', color: getLogColor(log.type) }}>
                {getLogEmoji(log.type)} [{new Date(log.timestamp).toLocaleTimeString()}] {log.type.toUpperCase()}
              </div>
              <div style={{ marginTop: '5px' }}>
                {log.message}
              </div>
              {log.data && (
                <details style={{ marginTop: '5px' }}>
                  <summary style={{ cursor: 'pointer', color: '#666' }}>
                    View Details
                  </summary>
                  <pre style={{ 
                    backgroundColor: '#f0f0f0', 
                    padding: '10px', 
                    marginTop: '5px',
                    fontSize: '11px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogViewer;