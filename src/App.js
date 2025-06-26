// src/App.js - Updated to integrate middleware
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TableProvider } from './context/TableContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import middlewareManager from './middlewares';
import logger from './utils/logger';
// Import Tailwind CSS first, then custom styles
import './styles/globals.css';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <TableProvider>
      <DashboardScreen />
    </TableProvider>
  );
};

const App = () => {
  useEffect(() => {
    // Install all middlewares when app starts
    logger.separator('APPLICATION STARTUP', 'INIT');
    logger.info('Initializing MyUsta Admin Panel', {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      version: process.env.REACT_APP_VERSION || '1.0.0'
    });

    // Install middlewares
    middlewareManager.installAll();

    // Log app initialization complete
    logger.success('Application initialized successfully');

    // Cleanup function
    return () => {
      logger.info('Application unmounting, cleaning up middlewares');
      middlewareManager.uninstallAll();
    };
  }, []);

  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
};

export default App;