// src/components/sidebar/DatabaseSidebar.js - Fixed nested button issue
import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  Server, 
  ChevronDown, 
  ChevronRight, 
  Table, 
  Info,
  Search,
  Layers,
  Eye,
  Settings,
  Wifi,
  WifiOff,
  AlertCircle,
  ChevronLeft,
  Menu,
  MoreVertical,
  Download,
  FileText,
  Package,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

// Mock imports - these would be your actual service imports
const TableService = {
  getTableData: async (table, options) => ({
    success: true,
    records: Array(50).fill().map((_, i) => ({ id: i + 1, name: `Record ${i + 1}`, status: 'active' }))
  }),
  getTableSchema: async (table) => ({
    success: true,
    attributes: [
      { name: 'id', type: 'INTEGER', primaryKey: true, allowNull: false },
      { name: 'name', type: 'STRING', allowNull: false },
      { name: 'status', type: 'STRING', allowNull: true }
    ],
    associations: []
  })
};

const DatabaseExportService = {
  exportAllTableData: async (backend, tables, options = {}) => {
    const { onProgress } = options;
    
    for (let i = 0; i <= 100; i += 10) {
      if (onProgress) {
        onProgress(i, `Processing table ${Math.floor(i/10) + 1} of ${tables.length}...`);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return {
      success: true,
      data: {
        database: backend,
        exportType: 'data',
        exportedAt: new Date().toISOString(),
        tableCount: tables.length,
        totalRecords: tables.length * 50,
        tables: tables.reduce((acc, table) => {
          acc[table.name] = {
            tableName: table.tableName,
            displayName: table.displayName,
            recordCount: 50,
            data: Array(50).fill().map((_, i) => ({ 
              id: i + 1, 
              name: `Record ${i + 1}`, 
              status: 'active' 
            })),
            exportedAt: new Date().toISOString()
          };
          return acc;
        }, {}),
        summary: {
          totalTables: tables.length,
          successfulTables: tables.length,
          failedTables: 0,
          totalRecords: tables.length * 50
        }
      }
    };
  },
  
  exportAllTableSchemas: async (backend, tables, options = {}) => {
    const { onProgress } = options;
    
    for (let i = 0; i <= 100; i += 20) {
      if (onProgress) {
        onProgress(i, `Processing schema ${Math.floor(i/20) + 1} of ${tables.length}...`);
      }
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    return {
      success: true,
      data: {
        database: backend,
        exportType: 'schema',
        exportedAt: new Date().toISOString(),
        tableCount: tables.length,
        tables: tables.reduce((acc, table) => {
          acc[table.name] = {
            tableName: table.tableName,
            displayName: table.displayName,
            attributes: [
              { name: 'id', type: 'INTEGER', primaryKey: true, allowNull: false },
              { name: 'name', type: 'STRING', allowNull: false },
              { name: 'status', type: 'STRING', allowNull: true }
            ],
            associations: [],
            statistics: {
              attributeCount: 3,
              associationCount: 0,
              requiredFields: 2,
              uniqueFields: 1
            },
            exportedAt: new Date().toISOString()
          };
          return acc;
        }, {}),
        summary: {
          totalTables: tables.length,
          successfulTables: tables.length,
          failedTables: 0,
          totalAttributes: tables.length * 3
        }
      }
    };
  },
  
  exportCompleteDatabase: async (backend, tables, options = {}) => {
    const { onProgress } = options;
    
    if (onProgress) onProgress(10, 'Exporting schemas...');
    const schemaResult = await DatabaseExportService.exportAllTableSchemas(backend, tables, {
      onProgress: (progress, message) => {
        if (onProgress) onProgress(10 + (progress * 0.4), message);
      }
    });
    
    if (onProgress) onProgress(50, 'Exporting data...');
    const dataResult = await DatabaseExportService.exportAllTableData(backend, tables, {
      onProgress: (progress, message) => {
        if (onProgress) onProgress(50 + (progress * 0.5), message);
      }
    });
    
    return {
      success: true,
      data: {
        database: backend,
        exportType: 'complete',
        exportedAt: new Date().toISOString(),
        schemas: schemaResult.data,
        data: dataResult.data,
        summary: {
          totalTables: tables.length,
          schemaExport: schemaResult.data.summary,
          dataExport: dataResult.data.summary,
          overallSuccess: true
        }
      }
    };
  },
  
  generateFilename: (backend, exportType) => {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const timeStamp = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '');
    return `${backend}_${exportType}_${timestamp}_${timeStamp}.json`;
  },
  
  downloadJSON: (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

const ExportProgressDialog = ({ isOpen, onClose, currentExport, ref }) => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('starting');
  const [exportData, setExportData] = useState(null);

  React.useImperativeHandle(ref, () => ({
    updateProgress: (newProgress, newMessage) => {
      setProgress(newProgress);
      setMessage(newMessage);
      setStatus(newProgress === 100 ? 'completed' : 'running');
    },
    handleExportComplete: (data) => {
      setExportData(data);
      setProgress(100);
      setStatus('completed');
      setMessage('Export completed successfully!');
    },
    handleExportError: (error) => {
      setStatus('error');
      setMessage(`Export failed: ${error}`);
    }
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold">
              {currentExport?.type === 'data' ? 'Exporting Data' : 
               currentExport?.type === 'schema' ? 'Exporting Schemas' : 
               'Complete Database Export'}
            </h3>
            <p className="text-sm text-gray-500 capitalize">
              {currentExport?.backend} Database
            </p>
          </div>
          {status === 'completed' && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            {status === 'running' && <Clock className="w-5 h-5 text-blue-600 animate-spin" />}
            {status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
            <span className="font-medium">{message}</span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  status === 'error' ? 'bg-red-500' : 
                  status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {exportData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Export Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tables:</span>
                  <span className="ml-2 font-medium">{exportData.summary?.totalTables || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Records:</span>
                  <span className="ml-2 font-medium">{exportData.summary?.totalRecords || 0}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            {status === 'completed' && exportData && (
              <button
                onClick={() => DatabaseExportService.downloadJSON(exportData, 
                  DatabaseExportService.generateFilename(currentExport.backend, currentExport.type))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Again</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              {status === 'error' ? 'Close' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DatabaseSidebar = ({ onTableSelect, isCollapsed, onToggleCollapse }) => {
  // Mock tables data
  const tables = {
    myusta: [
      { name: 'Customer', tableName: 'customers', displayName: 'Customers', backend: 'myusta', attributes: [] },
      { name: 'Usta', tableName: 'ustas', displayName: 'Ustas', backend: 'myusta', attributes: [] },
      { name: 'Job', tableName: 'jobs', displayName: 'Jobs', backend: 'myusta', attributes: [] },
      { name: 'Service', tableName: 'services', displayName: 'Services', backend: 'myusta', attributes: [] }
    ],
    chat: [
      { name: 'Conversation', tableName: 'conversations', displayName: 'Conversations', backend: 'chat', attributes: [] },
      { name: 'Message', tableName: 'messages', displayName: 'Messages', backend: 'chat', attributes: [] }
    ]
  };

  const loading = false;
  const error = null;
  const fetchTables = () => {};

  const [exportService] = useState(() => DatabaseExportService);
  const progressDialogRef = useRef(null);
  
  const [expandedSections, setExpandedSections] = useState({
    myusta: true,
    chat: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTables, setFilteredTables] = useState({ myusta: [], chat: [] });
  const [backendStatus, setBackendStatus] = useState({
    myusta: 'connected',
    chat: 'connected'
  });
  const [contextMenu, setContextMenu] = useState(null);
  const [exportProgress, setExportProgress] = useState({});
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [currentExport, setCurrentExport] = useState(null);
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const filterTables = (tableList) => {
      if (!searchTerm.trim()) return tableList;
      return tableList.filter(table => 
        table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.tableName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    };

    setFilteredTables({
      myusta: filterTables(tables.myusta || []),
      chat: filterTables(tables.chat || [])
    });
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTableClick = (table) => {
    if (onTableSelect) {
      onTableSelect();
    }
    console.log('Opening table:', table.displayName);
  };

  // FIXED: Database context menu handler - prevent event bubbling
  const handleDatabaseContextMenu = (e, backend) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      backend,
      x: e.clientX,
      y: e.clientY,
      tables: backend === 'myusta' ? filteredTables.myusta : filteredTables.chat
    });
  };

  // FIXED: Options button click handler - prevent event bubbling
  const handleOptionsClick = (e, backend) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      backend,
      x: e.clientX,
      y: e.clientY,
      tables: backend === 'myusta' ? filteredTables.myusta : filteredTables.chat
    });
  };

  const exportAllData = async (backend, tables) => {
    try {
      setCurrentExport({ type: 'data', backend });
      setShowProgressDialog(true);
      setContextMenu(null);

      const result = await exportService.exportAllTableData(backend, tables, {
        maxRecordsPerTable: 1000,
        includeMetadata: true,
        onProgress: (progress, message) => {
          if (progressDialogRef.current) {
            progressDialogRef.current.updateProgress(progress, message);
          }
        }
      });

      if (result.success) {
        const filename = exportService.generateFilename(backend, 'data_export');
        exportService.downloadJSON(result.data, filename);
        
        if (progressDialogRef.current) {
          progressDialogRef.current.handleExportComplete(result.data);
        }
        
        setExportProgress({ [backend]: `✅ Exported ${result.data.tableCount} tables` });
        setTimeout(() => setExportProgress({}), 3000);
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Data export failed:', error);
      if (progressDialogRef.current) {
        progressDialogRef.current.handleExportError(error.message);
      }
      setExportProgress({ [backend]: `❌ Export failed: ${error.message}` });
      setTimeout(() => setExportProgress({}), 5000);
    }
  };

  const exportAllSchemas = async (backend, tables) => {
    try {
      setCurrentExport({ type: 'schema', backend });
      setShowProgressDialog(true);
      setContextMenu(null);

      const result = await exportService.exportAllTableSchemas(backend, tables, {
        includeStatistics: true,
        onProgress: (progress, message) => {
          if (progressDialogRef.current) {
            progressDialogRef.current.updateProgress(progress, message);
          }
        }
      });

      if (result.success) {
        const filename = exportService.generateFilename(backend, 'schema_export');
        exportService.downloadJSON(result.data, filename);
        
        if (progressDialogRef.current) {
          progressDialogRef.current.handleExportComplete(result.data);
        }
        
        setExportProgress({ [backend]: `✅ Exported ${result.data.tableCount} schemas` });
        setTimeout(() => setExportProgress({}), 3000);
      } else {
        throw new Error(result.error || 'Schema export failed');
      }
    } catch (error) {
      console.error('Schema export failed:', error);
      if (progressDialogRef.current) {
        progressDialogRef.current.handleExportError(error.message);
      }
      setExportProgress({ [backend]: `❌ Schema export failed: ${error.message}` });
      setTimeout(() => setExportProgress({}), 5000);
    }
  };

  const exportCompleteDatabase = async (backend, tables) => {
    try {
      setCurrentExport({ type: 'complete', backend });
      setShowProgressDialog(true);
      setContextMenu(null);

      const result = await exportService.exportCompleteDatabase(backend, tables, {
        maxRecordsPerTable: 1000,
        includeMetadata: true,
        onProgress: (progress, message) => {
          if (progressDialogRef.current) {
            progressDialogRef.current.updateProgress(progress, message);
          }
        }
      });

      if (result.success) {
        const filename = exportService.generateFilename(backend, 'complete_export');
        exportService.downloadJSON(result.data, filename);
        
        if (progressDialogRef.current) {
          progressDialogRef.current.handleExportComplete(result.data);
        }
        
        setExportProgress({ [backend]: `✅ Complete export finished: ${result.data.summary.totalTables} tables` });
        setTimeout(() => setExportProgress({}), 3000);
      } else {
        throw new Error(result.error || 'Complete export failed');
      }
    } catch (error) {
      console.error('Complete export failed:', error);
      if (progressDialogRef.current) {
        progressDialogRef.current.handleExportError(error.message);
      }
      setExportProgress({ [backend]: `❌ Complete export failed: ${error.message}` });
      setTimeout(() => setExportProgress({}), 5000);
    }
  };

  const getBackendIcon = (backend) => {
    return backend === 'myusta' ? 
      <Database className="w-4 h-4" /> : 
      <Server className="w-4 h-4" />;
  };

  const getBackendColor = (backend) => {
    return backend === 'myusta' ? 'text-blue-600' : 'text-emerald-600';
  };

  const getBackendStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-3 h-3 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="w-3 h-3 text-orange-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" />;
    }
  };

  const TableItem = ({ table }) => (
    <div
      onClick={() => handleTableClick(table)}
      className="group flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
      title={`Table: ${table.tableName}\nAttributes: ${table.attributes?.length || 0}`}
    >
      <Table className="w-3 h-3 text-gray-500 group-hover:text-gray-700 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate text-sm">
          {table.displayName}
        </div>
        <div className="text-xs text-gray-500 truncate flex items-center space-x-1">
          <span className="font-mono text-xs">{table.tableName}</span>
          <span>•</span>
          <span>{table.attributes?.length || 0} fields</span>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Settings className="w-3 h-3 text-gray-400" />
      </div>
    </div>
  );

  // FIXED: DatabaseSection component - removed nested button
  const DatabaseSection = ({ title, icon, tables, backend, expanded, onToggle, status }) => (
    <div className="mb-3">
      <div className="relative">
        {/* FIXED: Main button - no nested buttons */}
        <div
          onClick={onToggle}
          onContextMenu={(e) => handleDatabaseContextMenu(e, backend)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors group cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <div className={getBackendColor(backend)}>
              {icon}
            </div>
            {!isCollapsed && (
              <>
                <span className="font-semibold">{title}</span>
                <div className="flex items-center space-x-1">
                  {getBackendStatusIcon(status)}
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {tables.length}
                  </span>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {!isCollapsed && (
              <>
                {/* FIXED: Separate clickable area for options - not a nested button */}
                <div
                  onClick={(e) => handleOptionsClick(e, backend)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all cursor-pointer"
                  title="Database options"
                >
                  <MoreVertical className="w-3 h-3 text-gray-500" />
                </div>
                {expanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </>
            )}
          </div>
        </div>

        {/* Export Progress Indicator */}
        {exportProgress[backend] && !isCollapsed && (
          <div className="absolute -bottom-8 left-3 right-3 bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs text-blue-700 z-10">
            {exportProgress[backend]}
          </div>
        )}
      </div>
      
      {!isCollapsed && expanded && (
        <div className="mt-2 ml-2 space-y-1 max-h-96 overflow-y-auto">
          {tables.length > 0 ? (
            tables.map((table) => (
              <TableItem key={`${table.backend}-${table.name}`} table={table} />
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500 italic">
              No tables available
            </div>
          )}
        </div>
      )}
    </div>
  );

  const ContextMenu = () => {
    if (!contextMenu) return null;

    return (
      <div
        ref={contextMenuRef}
        className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-48"
        style={{
          left: contextMenu.x,
          top: contextMenu.y,
        }}
      >
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            {getBackendIcon(contextMenu.backend)}
            <span className="font-semibold text-sm text-gray-900 capitalize">
              {contextMenu.backend} Database
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {contextMenu.tables.length} tables available
          </div>
        </div>

        <div className="py-1">
          <button
            onClick={() => exportAllData(contextMenu.backend, contextMenu.tables)}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
            disabled={!!exportProgress[contextMenu.backend]}
          >
            <Download className="w-4 h-4 text-blue-600" />
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">Export Data</div>
              <div className="text-xs text-gray-500">Download table records as JSON</div>
            </div>
          </button>

          <button
            onClick={() => exportAllSchemas(contextMenu.backend, contextMenu.tables)}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
            disabled={!!exportProgress[contextMenu.backend]}
          >
            <Database className="w-4 h-4 text-green-600" />
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">Export Schema</div>
              <div className="text-xs text-gray-500">Download table structures as JSON</div>
            </div>
          </button>

          <button
            onClick={() => exportCompleteDatabase(contextMenu.backend, contextMenu.tables)}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
            disabled={!!exportProgress[contextMenu.backend]}
          >
            <Package className="w-4 h-4 text-purple-600" />
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">Complete Export</div>
              <div className="text-xs text-gray-500">Download both data and schemas</div>
            </div>
          </button>
        </div>

        <div className="border-t border-gray-100 pt-1">
          <button
            onClick={() => setContextMenu(null)}
            className="w-full px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`${isCollapsed ? 'w-12' : 'w-80'} bg-white shadow-md border-r border-gray-200 flex flex-col h-full transition-all duration-300`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900">
                Database Explorer
              </h2>
            )}
            <button
              onClick={onToggleCollapse}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
          
          {!isCollapsed && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <DatabaseSection
            title="MyUsta Database"
            icon={<Database className="w-4 h-4" />}
            tables={filteredTables.myusta}
            backend="myusta"
            expanded={expandedSections.myusta}
            onToggle={() => toggleSection('myusta')}
            status={backendStatus.myusta}
          />

          <DatabaseSection
            title="Chat Database"
            icon={<Server className="w-4 h-4" />}
            tables={filteredTables.chat}
            backend="chat"
            expanded={expandedSections.chat}
            onToggle={() => toggleSection('chat')}
            status={backendStatus.chat}
          />
        </div>

        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>Total: {(filteredTables.myusta.length + filteredTables.chat.length)} tables</span>
                <div className="flex items-center space-x-1">
                  {getBackendStatusIcon(backendStatus.myusta)}
                  {getBackendStatusIcon(backendStatus.chat)}
                </div>
              </div>
              <div className="text-center text-xs text-gray-400 mt-2">
                Right-click database names for export options
              </div>
            </div>
          </div>
        )}
      </div>

      <ContextMenu />

      <ExportProgressDialog 
        ref={progressDialogRef}
        isOpen={showProgressDialog}
        onClose={() => setShowProgressDialog(false)}
        currentExport={currentExport}
      />
    </>
  );
};

export default DatabaseSidebar;