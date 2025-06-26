// src/screens/DashboardScreen.js - Fixed to prevent re-render loops
import React, { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTable } from '../context/TableContext';
import { WindowProvider } from '../context/WindowContext';
import Layout from '../components/common/Layout';
import DatabaseSidebar from '../components/sidebar/DatabaseSidebar';
import WindowContainer from '../components/windows/WindowContainer';
import WindowTaskbar from '../components/windows/WindowTaskbar';
import DebugPanel from '../components/debug/DebugPanel';
import { APP_CONFIG } from '../utils/constants';

const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const { 
    tables, 
    loading, 
    error, 
    fetchTables, 
    clearError
  } = useTable();

  // Track if we've already fetched tables to prevent multiple calls
  const hasFetchedRef = useRef(false);
  const renderCountRef = useRef(0);

  // Debug: Track renders
  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`🔄 DashboardScreen render #${renderCountRef.current}`);
    
    if (renderCountRef.current > 5) {
      console.warn('⚠️ DashboardScreen re-rendering frequently - potential loop detected');
    }
  });

  // Stable function references with useCallback
  const handleRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    hasFetchedRef.current = false; // Reset fetch flag for manual refresh
    fetchTables();
  }, [fetchTables]);

  const handleLogout = useCallback(async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  }, [logout]);

  // Fetch tables only once on mount or when explicitly needed
  useEffect(() => {
    const totalTables = (tables.myusta?.length || 0) + (tables.chat?.length || 0);
    const shouldFetch = !hasFetchedRef.current && !loading && totalTables === 0;
    
    console.log('📊 DashboardScreen useEffect check:', {
      hasFetched: hasFetchedRef.current,
      loading,
      totalTables,
      shouldFetch
    });

    if (shouldFetch) {
      console.log('🚀 Initiating table fetch');
      hasFetchedRef.current = true;
      fetchTables();
    }
  }, []); // Empty dependency array - only run on mount

  // Log state changes for debugging
  useEffect(() => {
    console.log('📊 Tables state changed:', {
      myustaCount: tables.myusta?.length || 0,
      chatCount: tables.chat?.length || 0,
      loading,
      hasError: !!error
    });
  }, [tables.myusta?.length, tables.chat?.length, loading, error]);

  return (
    <WindowProvider>
      <Layout
        title={APP_CONFIG.APP_NAME}
        user={user}
        onLogout={handleLogout}
        onRefresh={handleRefresh}
        loading={loading}
      >
        <div className="flex h-full">
          {/* Left Sidebar - Database Explorer */}
          <DatabaseSidebar />

          {/* Main Content Area - Windows Container */}
          <div className="flex-1 relative bg-gray-100">
            {/* Error Display */}
            {error && (
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 animate-fade-in">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                    <button
                      onClick={clearError}
                      className="ml-auto text-red-400 hover:text-red-600 px-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Welcome Message when no windows */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center animate-fade-in">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7c0-2.21 1.79-4 4-4h8c2.21 0 4-1.79 4-4M4 7h16m-4 4v6m-4-6v6m-4-6v6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to MyUsta Admin Panel
                </h3>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl">
                  The smart dashboard for your thriving service ecosystem. Manage Usta onboarding, 
                  customer relationships, service delivery, and performance analytics with precision.
                </p>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 max-w-md mx-auto">
                  <h4 className="font-semibold text-gray-900 mb-3">Get Started:</h4>
                  <ul className="text-left space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Click on any table in the sidebar to view data
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Right-click tables for more options
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Multiple windows can be opened simultaneously
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                      Use window controls to arrange your workspace
                    </li>
                    {process.env.NODE_ENV === 'development' && (
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                        Check console for debug logs (Render: #{renderCountRef.current})
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Windows Container */}
            <WindowContainer />
          </div>
        </div>

        {/* Window Taskbar */}
        <WindowTaskbar />

        {/* Debug Panel (only in development) */}
        {process.env.NODE_ENV === 'development' && <DebugPanel />}
      </Layout>
    </WindowProvider>
  );
};

export default DashboardScreen;