// src/components/dialogs/ExportProgressDialog.jsx - Export progress modal
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Database,
  FileText,
  Package,
  Activity
} from 'lucide-react';

const ExportProgressDialog = ({ 
  isOpen, 
  onClose, 
  exportType, 
  backend, 
  onExportComplete 
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('starting');
  const [message, setMessage] = useState('Initializing export...');
  const [exportData, setExportData] = useState(null);
  const [errors, setErrors] = useState([]);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setStatus('starting');
      setMessage('Initializing export...');
      setExportData(null);
      setErrors([]);
    }
  }, [isOpen]);

  // Update progress from parent component
  const updateProgress = (newProgress, newMessage, newStatus = 'running') => {
    setProgress(newProgress);
    setMessage(newMessage);
    setStatus(newStatus);
  };

  // Handle export completion
  const handleExportComplete = (data, exportErrors = []) => {
    setExportData(data);
    setErrors(exportErrors);
    setProgress(100);
    setStatus(exportErrors.length > 0 ? 'completed_with_errors' : 'completed');
    setMessage(exportErrors.length > 0 ? 'Export completed with some errors' : 'Export completed successfully!');
    
    if (onExportComplete) {
      onExportComplete(data);
    }
  };

  // Handle export error
  const handleExportError = (error) => {
    setStatus('error');
    setMessage(`Export failed: ${error}`);
    setErrors([{ table: 'System', error }]);
  };

  // Get export type info
  const getExportTypeInfo = () => {
    switch (exportType) {
      case 'data':
        return {
          icon: <Download className="w-6 h-6" />,
          title: 'Exporting Table Data',
          description: 'Downloading all table records as JSON'
        };
      case 'schema':
        return {
          icon: <Database className="w-6 h-6" />,
          title: 'Exporting Table Schemas',
          description: 'Downloading table structures and metadata'
        };
      case 'complete':
        return {
          icon: <Package className="w-6 h-6" />,
          title: 'Complete Database Export',
          description: 'Downloading both data and schemas'
        };
      default:
        return {
          icon: <FileText className="w-6 h-6" />,
          title: 'Database Export',
          description: 'Processing export request'
        };
    }
  };

  // Get status icon and color
  const getStatusInfo = () => {
    switch (status) {
      case 'starting':
      case 'running':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'completed_with_errors':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      default:
        return {
          icon: <Activity className="w-5 h-5" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  // Expose methods to parent
  React.useImperativeHandle(React.forwardRef((props, ref) => ({
    updateProgress,
    handleExportComplete,
    handleExportError
  })), []);

  if (!isOpen) return null;

  const exportInfo = getExportTypeInfo();
  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="text-blue-600">
              {exportInfo.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {exportInfo.title}
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {backend} Database • {exportInfo.description}
              </p>
            </div>
          </div>
          
          {(status === 'completed' || status === 'completed_with_errors' || status === 'error') && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Progress Section */}
        <div className="p-6">
          {/* Status Icon and Message */}
          <div className={`flex items-center space-x-3 p-4 rounded-lg ${statusInfo.bgColor} mb-4`}>
            <div className={statusInfo.color}>
              {statusInfo.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{message}</div>
              {exportData && (
                <div className="text-sm text-gray-600 mt-1">
                  {exportData.summary && (
                    <span>
                      {exportData.summary.successfulTables || 0} tables processed successfully
                      {exportData.summary.failedTables > 0 && 
                        `, ${exportData.summary.failedTables} failed`
                      }
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  status === 'error' ? 'bg-red-500' : 
                  status === 'completed_with_errors' ? 'bg-yellow-500' :
                  status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Export Summary */}
          {exportData && exportData.summary && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Export Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Tables:</span>
                  <span className="ml-2 font-medium">{exportData.summary.totalTables || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Successful:</span>
                  <span className="ml-2 font-medium text-green-600">{exportData.summary.successfulTables || 0}</span>
                </div>
                {exportData.summary.totalRecords !== undefined && (
                  <div>
                    <span className="text-gray-600">Records:</span>
                    <span className="ml-2 font-medium">{(exportData.summary.totalRecords || 0).toLocaleString()}</span>
                  </div>
                )}
                {exportData.summary.totalAttributes !== undefined && (
                  <div>
                    <span className="text-gray-600">Attributes:</span>
                    <span className="ml-2 font-medium">{exportData.summary.totalAttributes || 0}</span>
                  </div>
                )}
                {exportData.duration && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">{Math.round(exportData.duration / 1000)}s</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-red-900 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Export Errors ({errors.length})
              </h4>
              <div className="max-h-32 overflow-y-auto">
                {errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 mb-1">
                    <span className="font-medium">{error.table}:</span> {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {status === 'starting' || status === 'running' ? (
              <button
                disabled
                className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
              >
                Exporting...
              </button>
            ) : (
              <>
                {(status === 'completed' || status === 'completed_with_errors') && exportData && (
                  <button
                    onClick={() => {
                      // Trigger download again if needed
                      if (window.downloadExportData) {
                        window.downloadExportData(exportData);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Again</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {status === 'error' ? 'Close' : 'Done'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportProgressDialog;