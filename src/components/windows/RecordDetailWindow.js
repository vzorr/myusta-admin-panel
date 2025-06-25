// src/components/windows/RecordDetailWindow.js
import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Edit2, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Copy,
  Download,
  Calendar,
  Hash,
  Type,
  FileText,
  Database,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import TableService from '../../services/tableService';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatCurrency, copyToClipboard } from '../../utils/helpers';

const RecordDetailWindow = ({ window }) => {
  const { token } = useAuth();
  const [tableService] = useState(() => new TableService(token));
  
  const [record, setRecord] = useState(window.data?.record || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [schema, setSchema] = useState(null);
  const [showRawData, setShowRawData] = useState(false);

  const { table } = window;

  const fetchRecord = async () => {
    if (!record?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await tableService.getRecord(table, record.id);
      
      if (result.success) {
        setRecord(result.record);
      } else {
        setError(result.error || 'Failed to fetch record');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchema = async () => {
    try {
      const result = await tableService.getTableSchema(table);
      if (result.success) {
        setSchema(result);
      }
    } catch (err) {
      console.warn('Failed to fetch schema:', err);
    }
  };

  useEffect(() => {
    fetchSchema();
    if (record?.id) {
      fetchRecord();
    }
  }, [table.name, record?.id]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...record });
  };

  const handleSave = async () => {
    try {
      const result = await tableService.updateRecord(table, record.id, editData);
      
      if (result.success) {
        setRecord({ ...record, ...editData });
        setIsEditing(false);
        setEditData({});
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(JSON.stringify(record, null, 2));
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getFieldIcon = (fieldName, fieldType) => {
    const fieldIcons = {
      'id': <Hash className="w-4 h-4 text-blue-600" />,
      'email': <Type className="w-4 h-4 text-green-600" />,
      'password': <Eye className="w-4 h-4 text-red-600" />,
      'phone': <Type className="w-4 h-4 text-purple-600" />,
      'createdAt': <Calendar className="w-4 h-4 text-gray-600" />,
      'updatedAt': <Calendar className="w-4 h-4 text-gray-600" />,
      'bio': <FileText className="w-4 h-4 text-orange-600" />,
      'description': <FileText className="w-4 h-4 text-orange-600" />
    };

    if (fieldIcons[fieldName]) return fieldIcons[fieldName];
    
    // Type-based icons
    const typeIcons = {
      'INTEGER': <Hash className="w-4 h-4 text-blue-600" />,
      'STRING': <Type className="w-4 h-4 text-green-600" />,
      'TEXT': <FileText className="w-4 h-4 text-purple-600" />,
      'BOOLEAN': <CheckCircle className="w-4 h-4 text-orange-600" />,
      'DATE': <Calendar className="w-4 h-4 text-red-600" />,
      'DATEONLY': <Calendar className="w-4 h-4 text-red-600" />
    };
    
    return typeIcons[fieldType] || <Database className="w-4 h-4 text-gray-500" />;
  };

  const formatFieldValue = (key, value, fieldInfo) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }

    // Special formatting based on field name
    if (key.toLowerCase().includes('email')) {
      return (
        <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      );
    }

    if (key.toLowerCase().includes('phone')) {
      return (
        <a href={`tel:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      );
    }

    if (key.toLowerCase().includes('url') || key.toLowerCase().includes('picture')) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {value}
        </a>
      );
    }

    if (key.toLowerCase().includes('password')) {
      return <span className="text-gray-400 font-mono">••••••••</span>;
    }

    // Type-based formatting
    if (fieldInfo?.type === 'BOOLEAN') {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
          {value ? 'Yes' : 'No'}
        </span>
      );
    }

    if (fieldInfo?.type === 'DATE' || fieldInfo?.type === 'DATEONLY' || key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
      try {
        return formatDate(value);
      } catch {
        return value;
      }
    }

    if (typeof value === 'object') {
      return (
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-w-md">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    if (typeof value === 'string' && value.length > 100) {
      return (
        <div>
          <div className="text-sm text-gray-900">{value.substring(0, 100)}...</div>
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            {showRawData ? 'Show less' : 'Show more'}
          </button>
        </div>
      );
    }

    return <span className="text-gray-900">{value.toString()}</span>;
  };

  const getFieldInfo = (fieldName) => {
    return schema?.attributes?.find(attr => attr.name === fieldName);
  };

  if (!record) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Info className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No record data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Record #{record.id}
            </h3>
            <p className="text-sm text-gray-500">
              {table.displayName} • {table.backend} backend
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            title={showRawData ? "Show formatted view" : "Show raw JSON"}
          >
            {showRawData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showRawData ? 'Formatted' : 'Raw'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            title="Copy record data"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>

          <button
            onClick={fetchRecord}
            disabled={loading}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
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

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {showRawData ? (
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(record, null, 2)}
          </pre>
        ) : (
          <div className="space-y-4">
            {Object.entries(record).map(([key, value]) => {
              const fieldInfo = getFieldInfo(key);
              const isRequired = fieldInfo?.allowNull === false;
              const isPrimaryKey = fieldInfo?.primaryKey;
              
              return (
                <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getFieldIcon(key, fieldInfo?.type)}
                      <label className="text-sm font-medium text-gray-900">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      {isPrimaryKey && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          PRIMARY KEY
                        </span>
                      )}
                      {isRequired && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          REQUIRED
                        </span>
                      )}
                      {fieldInfo?.unique && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          UNIQUE
                        </span>
                      )}
                    </div>
                    {fieldInfo?.type && (
                      <span className="text-xs text-gray-500 font-mono">
                        {fieldInfo.type}
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    {isEditing && key !== 'id' && !key.includes('createdAt') && !key.includes('updatedAt') ? (
                      <input
                        type={fieldInfo?.type === 'BOOLEAN' ? 'checkbox' : 'text'}
                        value={fieldInfo?.type === 'BOOLEAN' ? undefined : (editData[key] || '')}
                        checked={fieldInfo?.type === 'BOOLEAN' ? editData[key] : undefined}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          [key]: fieldInfo?.type === 'BOOLEAN' ? e.target.checked : e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isPrimaryKey}
                      />
                    ) : (
                      formatFieldValue(key, value, fieldInfo)
                    )}
                  </div>

                  {fieldInfo?.validate && Object.keys(fieldInfo.validate).length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Validation:</strong> {Object.entries(fieldInfo.validate).map(([rule, val]) => 
                        `${rule}: ${JSON.stringify(val)}`
                      ).join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordDetailWindow;