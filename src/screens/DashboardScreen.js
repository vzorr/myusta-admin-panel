// src/screens/DashboardScreen.js - Fixed useWindows hook issue
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTable } from '../context/TableContext';

import Layout from '../components/common/Layout';
import DatabaseSidebar from '../components/sidebar/DatabaseSidebar';
import WindowContainer from '../components/windows/WindowContainer';
import WindowTaskbar from '../components/windows/WindowTaskbar';
import KpiCards from '../components/dashboard/KpiCards';
import DebugPanel from '../components/debug/DebugPanel';
import { APP_CONFIG } from '../utils/constants';
import { Menu, X } from 'lucide-react';
import {WindowProvider, useWindows } from '../context/WindowContext';

// Separate component that uses useWindows inside WindowProvider
const DashboardContent = () => {
  const { user, logout } = useAuth();
  const { 
    tables, 
    loading, 
    error, 
    fetchTables, 
    clearError
  } = useTable();
  const { setSidebarWidth } = useWindows(); // Now inside WindowProvider

  // Sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  // Sidebar toggle handlers
  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed(prev => {
      const newCollapsed = !prev;
      // Update window context with new sidebar width
      setSidebarWidth(newCollapsed ? 48 : 320);
      return newCollapsed;
    });
  }, [setSidebarWidth]);

  // Update sidebar width when component mounts
  useEffect(() => {
    setSidebarWidth(isSidebarCollapsed ? 48 : 320);
  }, [isSidebarCollapsed, setSidebarWidth]);

  // Close mobile sidebar when clicking outside
  const handleOverlayClick = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  // Close mobile sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Calculate content area width based on sidebar state
  const getSidebarWidth = () => {
    if (isSidebarCollapsed) return 'w-12'; // 48px
    return 'w-80'; // 320px
  };

  const getContentMargin = () => {
    if (isSidebarCollapsed) return 'lg:ml-12'; // 48px margin
    return 'lg:ml-80'; // 320px margin
  };

  return (
    <Layout
      title={APP_CONFIG.APP_NAME}
      user={user}
      onLogout={handleLogout}
      onRefresh={handleRefresh}
      loading={loading}
    >
      <div className="flex h-full relative">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        {/* Mobile Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={handleOverlayClick}
          />
        )}

        {/* Left Sidebar - Desktop always visible, Mobile slide-in */}
        <div className={`
          fixed lg:relative
          top-0 left-0 h-full
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          z-50 lg:z-auto
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 z-10 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Close sidebar menu"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          <DatabaseSidebar 
            onTableSelect={() => setIsMobileSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        </div>

        {/* Main Content Area - Responsive to sidebar state */}
        <div className={`flex-1 relative bg-gray-100 overflow-y-auto transition-all duration-300 ${getContentMargin()}`}>
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
                  Fetching models from MyUsta and Chat backends
                </p>
              </div>
            </div>
          )}

          {/* Main Dashboard Content */}
          {!loading && (tables.myusta?.length || 0) + (tables.chat?.length || 0) > 0 && (
            <div className="relative pt-16 lg:pt-0">
              {/* Add padding-top for mobile to account for burger menu button */}
              
              {/* KPI Cards - Always visible when data is loaded */}
              <div className="px-4 lg:px-0">
                <KpiCards />
              </div>
            </div>
          )}

          {/* Empty state when no tables are available */}
          {!loading && !error && (tables.myusta?.length || 0) + (tables.chat?.length || 0) === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pt-16 lg:pt-0">
              <div className="text-center px-4">
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

          {/* Windows Container - overlays on top of dashboard, uses full available area */}
          <WindowContainer />
        </div>
      </div>

      {/* Window Taskbar */}
      <WindowTaskbar />

      {/* Debug Panel (only in development) */}
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
    </Layout>
  );
};

// Main component that provides the WindowProvider
const DashboardScreen = () => {
  return (
    <WindowProvider>
      <DashboardContent />
    </WindowProvider>
  );
};

export default DashboardScreen;