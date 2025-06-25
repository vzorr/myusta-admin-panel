// src/screens/DashboardScreen.js
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTable } from '../context/TableContext';
import Layout from '../components/common/Layout';
import TableList from '../components/table/TableList';
import DataTable from '../components/table/TableList';
import { APP_CONFIG } from '../utils/constants';

const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const { 
    tables, 
    selectedTable, 
    data, 
    loading, 
    error, 
    fetchTables, 
    selectTable, 
    refreshTableData,
    clearError
  } = useTable();

  useEffect(() => {
    fetchTables();
  }, []);

  const handleTableSelect = (table) => {
    clearError();
    selectTable(table);
  };

  const handleRefresh = () => {
    if (selectedTable) {
      refreshTableData();
    } else {
      fetchTables();
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <Layout
      title={APP_CONFIG.APP_NAME}
      user={user}
      onLogout={handleLogout}
      onRefresh={handleRefresh}
      loading={loading}
    >
      <div className="flex h-full">
        {/* Left Sidebar - Tables */}
        <div className="w-64 bg-white shadow-md border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Database Tables
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {tables.length} tables available
            </p>
          </div>
          
          <TableList
            tables={tables}
            selectedTable={selectedTable}
            onTableSelect={handleTableSelect}
            loading={loading}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {selectedTable ? (
            <DataTable
              table={selectedTable}
              data={data}
              loading={loading}
              onRefresh={refreshTableData}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7c0-2.21 1.79-4 4-4h8c2.21 0 4-1.79 4-4M4 7h16m-4 4v6m-4-6v6m-4-6v6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Table
                </h3>
                <p className="text-gray-500">
                  Choose a table from the sidebar to view and manage its data
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardScreen;