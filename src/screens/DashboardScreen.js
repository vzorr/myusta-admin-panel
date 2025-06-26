// src/screens/DashboardScreen.js - Updated with KPI cards
import React, { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTable } from '../context/TableContext';
import { WindowProvider } from '../context/WindowContext';
import Layout from '../components/common/Layout';
import DatabaseSidebar from '../components/sidebar/DatabaseSidebar';
import WindowContainer from '../components/windows/WindowContainer';
import WindowTaskbar from '../components/windows/WindowTaskbar';
import KpiCards from '../components/dashboard/KpiCards';
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

  // Track fetch status to prevent duplicate calls
  const hasFetchedRef = useRef(false);
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(Date.now());

  // Debug: Track renders (remove in production)
  useEffect(() => {
    renderCountRef.current += 1;
    const timeSinceMount = Date.now() - mountTimeRef.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 DashboardScreen render #${renderCountRef.current} (${timeSinceMount}ms since mount)`);
      
      if (renderCountRef.current > 5 && timeSinceMount < 5000) {
        console.warn('⚠️ DashboardScreen re-rendering frequently - potential issue detected');
      }
    }
  });

  // Stable function references with useCallback
  const handleRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered by user');
    hasFetchedRef.current = false; // Reset fetch flag for manual refresh
    fetchTables();
  }, [fetchTables]);

  const handleLogout = useCallback(async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  }, [logout]);

  // Only fetch tables once on mount
  useEffect(() => {
    const totalTables = (tables.myusta?.length || 0) + (tables.chat?.length || 0);
    
    // More specific conditions to prevent duplicate calls
    const shouldFetch = (
      !hasFetchedRef.current &&  // Haven't fetched yet
      !loading &&               // Not currently loading
      totalTables === 0 &&      // No tables loaded
      !error                    // No current error
    );
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 DashboardScreen fetch check:', {
        hasFetched: hasFetchedRef.current,
        loading,
        totalTables,
        hasError: !!error,
        shouldFetch,
        renderCount: renderCountRef.current,
        timeSinceMount: Date.now() - mountTimeRef.current
      });
    }

    if (shouldFetch) {
      console.log('🚀 Initiating table fetch (first time)');
      hasFetchedRef.current = true;
      fetchTables().catch(err => {
        console.error('❌ Failed to fetch tables:', err);
        hasFetchedRef.current = false; // Reset on error so user can retry
      });
    }
  }, []); // Keep empty dependency array

  // Separate effect for logging state changes (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Tables state update:', {
        myustaCount: tables.myusta?.length || 0,
        chatCount: tables.chat?.length || 0,
        loading,
        hasError: !!error,
        renderCount: renderCountRef.current
      });
    }
  }, [tables.myusta?.length, tables.chat?.length, loading, error]);

  // Monitor if tables are successfully loaded
  useEffect(() => {
    const totalTables = (tables.myusta?.length || 0) + (tables.chat?.length || 0);
    if (totalTables > 0 && !loading) {
      console.log(`✅ Tables loaded successfully: ${totalTables} total`);
    }
  }, [tables, loading]);

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

          {/* Main Content Area */}
          <div className="flex-1 relative bg-gray-100 overflow-y-auto">
            {/* Error Display */}
            {error && (
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 animate-fade-in">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                      <p className="text-xs text-red-600 mt-1">
                        You can try refreshing to reload the data.
                      </p>
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

            {/* Loading indicator for initial load */}
            {loading && (tables.myusta?.length || 0) + (tables.chat?.length || 0) === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading database tables...</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Fetching models from MyUsta backend
                  </p>
                </div>
              </div>
            )}

            {/* Main Dashboard Content */}
            {!loading && (tables.myusta?.length || 0) + (tables.chat?.length || 0) > 0 && (
              <div className="relative">
                {/* KPI Cards - Always visible when data is loaded */}
                <KpiCards />
                
               
              </div>
            )}

            {/* Empty state when no tables are available */}
            {!loading && !error && (tables.myusta?.length || 0) + (tables.chat?.length || 0) === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Tables Available</h3>
                  <p className="text-gray-500 mb-4">
                    No database tables were found. Please check your backend connection.
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    🔄 Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Windows Container - overlays on top of dashboard */}
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