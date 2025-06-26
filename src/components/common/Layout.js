// src/components/common/Layout.js - Enhanced responsive layout
import React, { useState, useEffect } from 'react';
import { RefreshCw, LogOut, Database, Menu, X } from 'lucide-react';

const Layout = ({ title, user, onLogout, onRefresh, loading, children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-30">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and title */}
            <div className="flex items-center">
              <Database className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 mr-2 lg:mr-3" />
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">Database Administration</p>
              </div>
            </div>
            
            {/* Right side - Actions and user info */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Refresh button */}
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 lg:w-4 lg:h-4 ${isMobile ? '' : 'mr-2'} ${loading ? 'animate-spin' : ''}`} />
                {!isMobile && <span>Refresh</span>}
              </button>
              
              {/* User info and logout */}
              <div className="flex items-center space-x-2 lg:space-x-3">
                {/* User info - Hidden on mobile */}
                {!isMobile && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || user?.email || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
                  </div>
                )}
                
                {/* Logout button */}
                <button
                  onClick={onLogout}
                  className="flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <LogOut className={`w-3 h-3 lg:w-4 lg:h-4 ${isMobile ? '' : 'mr-2'}`} />
                  {!isMobile && <span>Logout</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile user info bar */}
          {isMobile && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || user?.email || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
                </div>
                <div className="text-xs text-gray-500">
                  Database Administration
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;