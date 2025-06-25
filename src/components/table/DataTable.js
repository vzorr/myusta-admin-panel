
// src/components/table/DataTable.js
import React from 'react';
import { RefreshCw, Edit2, Trash2, Save, X } from 'lucide-react';
import { useTable } from '../../context/TableContext';

const DataTable = ({ table, data, loading, onRefresh }) => {
  const {
    editingRow,
    editData,
    startEditing,
    updateEditData,
    cancelEditing,
    saveRow,
    deleteRow
  } = useTable();

  const handleSave = async (id) => {
    const result = await saveRow(id);
    if (result.success) {
      // Success feedback could be added here
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      const result = await deleteRow(id);
      if (result.success) {
        // Success feedback could be added here
      }
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading table data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
          <p className="text-gray-500 mb-4">This table appears to be empty</p>
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Table Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {table.displayName || table.name}
            </h3>
            <p className="text-sm text-gray-500">
              {data.length} records • {table.backend} backend
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  {column.replace(/_/g, ' ')}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column} className="px-4 py-3 text-sm">
                    {editingRow === row.id ? (
                      <input
                        type="text"
                        value={editData[column] || ''}
                        onChange={(e) => updateEditData(column, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="block max-w-xs truncate" title={formatValue(row[column])}>
                        {formatValue(row[column])}
                      </span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    {editingRow === row.id ? (
                      <>
                        <button
                          onClick={() => handleSave(row.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Save changes"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-600 hover:text-gray-800"
                          title="Cancel editing"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(row)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit record"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;