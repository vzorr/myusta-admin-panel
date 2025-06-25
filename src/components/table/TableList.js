// src/components/table/TableList.js
import React from 'react';
import { Database, Server } from 'lucide-react';
import { BACKEND_TYPES } from '../../utils/constants';

const TableList = ({ tables, selectedTable, onTableSelect, loading }) => {
  const getBackendIcon = (backend) => {
    return backend === BACKEND_TYPES.MYUSTA ? <Database className="w-4 h-4" /> : <Server className="w-4 h-4" />;
  };

  const getBackendColor = (backend) => {
    return backend === BACKEND_TYPES.MYUSTA ? 'text-blue-600' : 'text-green-600';
  };

  if (loading && tables.length === 0) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2 max-h-[calc(100vh-160px)] overflow-y-auto">
      {tables.map((table) => (
        <button
          key={`${table.backend}-${table.name}`}
          onClick={() => onTableSelect(table)}
          className={`w-full text-left p-3 rounded-lg transition-all duration-200 border ${
            selectedTable?.name === table.name && selectedTable?.backend === table.backend
              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
              : 'hover:bg-gray-50 border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={getBackendColor(table.backend)}>
                {getBackendIcon(table.backend)}
              </div>
              <div>
                <div className="font-medium text-sm">
                  {table.displayName || table.name}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {table.backend} backend
                </div>
              </div>
            </div>
          </div>
        </button>
      ))}
      
      {tables.length === 0 && !loading && (
        <div className="text-center py-8">
          <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No tables available</p>
        </div>
      )}
    </div>
  );
};

export default TableList;
