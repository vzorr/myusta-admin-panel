// src/components/windows/TableDataWindow.js - Updated with font size controls
import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Download,
  ZoomIn,
  ZoomOut,
  Type
} from 'lucide-react';
import { useTable } from '../../context/TableContext';
import { useWindows, WINDOW_TYPES } from '../../context/WindowContext';
import TableService from '../../services/tableService';
import { useAuth } from '../../context/AuthContext';

const TableDataWindow = ({ window }) => {
  const { token } = useAuth();
  const { updateWindowData, openWindow } = useWindows();
  const [tableService] = useState(() => new TableService(token));
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  // Font size state
  const [fontSize, setFontSize] = useState('text-sm'); // Default size
  const fontSizes = [
    { label: 'XS', value: 'text-xs', name: 'Extra Small' },
    { label: 'SM', value: 'text-sm', name: 'Small' },
    { label: 'MD', value: 'text-base', name: 'Medium' },
    { label: 'LG', value: 'text-lg', name: 'Large' }
  ];

  const { table } = window;

  const fetchData = async (options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await tableService.getTableData(table, {
        page: options.page || window.data?.page || 1,
        size: options.size || window.data?.size || 20,
        search: options.search !== undefined ? options.search : searchTerm,
        sortBy: options.sortBy || sortBy,
        sortOrder: options.sortOrder || sortOrder,
        filters: options.filters || filters
      });

      if (result.success) {
        setData(result.records);
        setPagination(result.pagination);
        
        updateWindowData(window.id, {
          ...window.data,
          ...options,
          lastFetched: new Date().toISOString()
        });
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table.name]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchData({ search: value, page: 1 });
  };

  const handleSort = (column) => {
    const newOrder = sortBy === column && sortOrder === 'ASC' ? 'DESC' : 'ASC';
    setSortBy(column);
    setSortOrder(newOrder);
    fetchData({ sortBy: column, sortOrder: newOrder });
  };

  const handlePageChange = (newPage) => {
    fetchData({ page: newPage });
  };

  const handleEdit = (row) => {
    setEditingRow(row.id);
    setEditData({ ...row });
  };

  const handleSave = async (rowId) => {
    try {
      const result = await tableService.updateRecord(table, rowId, editData);
      
      if (result.success) {
        setData(data.map(row => 
          row.id === rowId ? { ...row, ...editData } : row
        ));
        setEditingRow(null);
        setEditData({});
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (rowId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const result = await tableService.deleteRecord(table, rowId);
        
        if (result.success) {
          setData(data.filter(row => row.id !== rowId));
          setPagination(prev => ({
            ...prev,
            totalItems: prev.totalItems - 1
          }));
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleViewRecord = (row) => {
    openWindow({
      type: WINDOW_TYPES.RECORD_DETAIL,
      title: `${table.displayName} - Record #${row.id}`,
      table: table,
      data: { record: row }
    });
  };

  const formatValue = (value, field) => {
    if (value === null || value === undefined) return '-';
    
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    
    return value.toString();
  };

  const increaseFontSize = () => {
    const currentIndex = fontSizes.findIndex(size => size.value === fontSize);
    if (currentIndex < fontSizes.length - 1) {
      setFontSize(fontSizes[currentIndex + 1].value);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = fontSizes.findIndex(size => size.value === fontSize);
    if (currentIndex > 0) {
      setFontSize(fontSizes[currentIndex - 1].value);
    }
  };

  const getCurrentFontSizeLabel = () => {
    return fontSizes.find(size => size.value === fontSize)?.label || 'SM';
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : table.attributes || [];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Font Size Controls */}
          <div className="flex items-center space-x-1 border border-gray-300 rounded-md">
            <button
              onClick={decreaseFontSize}
              disabled={fontSize === fontSizes[0].value}
              className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Decrease font size"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            
            <div className="flex items-center px-2 py-1 text-xs font-medium text-gray-700 border-x border-gray-300">
              <Type className="w-3 h-3 mr-1" />
              {getCurrentFontSizeLabel()}
            </div>
            
            <button
              onClick={increaseFontSize}
              disabled={fontSize === fontSizes[fontSizes.length - 1].value}
              className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Increase font size"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          <span className="text-sm text-gray-600">
            {pagination.totalItems || 0} records
          </span>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="p-1 border border-gray-300 rounded disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-2 py-1 text-sm">
              {pagination.currentPage || 1} / {pagination.totalPages || 1}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="p-1 border border-gray-300 rounded disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Table Content with dynamic font size */}
      <div className="flex-1 overflow-auto">
        {loading && data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading table data...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? `No records match "${searchTerm}"` : 'This table appears to be empty'}
              </p>
              <button
                onClick={() => fetchData()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="w-8 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(data.map(row => row.id)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                {columns.map((column) => (
                  <th
                    key={column}
                    className={`px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${fontSize === 'text-xs' ? 'text-xs' : fontSize === 'text-sm' ? 'text-xs' : fontSize === 'text-base' ? 'text-sm' : 'text-base'}`}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.replace(/_/g, ' ')}</span>
                      {sortBy === column && (
                        <span className="text-blue-600">
                          {sortOrder === 'ASC' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className={`px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider ${fontSize === 'text-xs' ? 'text-xs' : fontSize === 'text-sm' ? 'text-xs' : fontSize === 'text-base' ? 'text-sm' : 'text-base'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedRows);
                        if (e.target.checked) {
                          newSelected.add(row.id);
                        } else {
                          newSelected.delete(row.id);
                        }
                        setSelectedRows(newSelected);
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column} className={`px-4 py-3 ${fontSize}`}>
                      {editingRow === row.id ? (
                        <input
                          type="text"
                          value={editData[column] || ''}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            [column]: e.target.value
                          }))}
                          className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${fontSize}`}
                        />
                      ) : (
                        <span 
                          className="block max-w-xs truncate cursor-pointer hover:text-blue-600"
                          title={formatValue(row[column])}
                          onClick={() => handleViewRecord(row)}
                        >
                          {formatValue(row[column])}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className={`px-4 py-3 ${fontSize}`}>
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
                            onClick={() => {
                              setEditingRow(null);
                              setEditData({});
                            }}
                            className="text-gray-600 hover:text-gray-800"
                            title="Cancel editing"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleViewRecord(row)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(row)}
                            className="text-yellow-600 hover:text-yellow-800"
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
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <div>
            Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
            {pagination.totalItems} records
            <span className="ml-2 text-gray-400">• Font: {getCurrentFontSizeLabel()}</span>
          </div>
          <div>
            {selectedRows.size > 0 && (
              <span>{selectedRows.size} selected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDataWindow;