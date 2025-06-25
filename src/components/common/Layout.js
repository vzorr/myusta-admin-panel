// src/components/common/Layout.js
import React from 'react';
import { RefreshCw, LogOut, Database } from 'lucide-react';

const Layout = ({ title, user, onLogout, onRefresh, loading, children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500">Database Administration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || user?.email || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
                </div>
                
                <button
                  onClick={onLogout}
                  className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  );
};

export default Layout;

