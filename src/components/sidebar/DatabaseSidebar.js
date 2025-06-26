// src/components/sidebar/DatabaseSidebar.js - Enhanced with export context menu
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
  Database as DatabaseIcon,
  Package
} from 'lucide-react';
import { useTable } from '../../context/TableContext';
import { useWindows, WINDOW_TYPES } from '../../context/WindowContext';
import { BACKEND_TYPES } from '../../utils/constants';
import TableService from '../../services/tableService';
import { useAuth } from '../../context/AuthContext';

const DatabaseSidebar = ({ onTableSelect, isCollapsed, onToggleCollapse }) => {
  const { tables, loading, fetchTables, error } = useTable();
  const { openWindow } = useWindows();
  const { token } = useAuth();
  const [tableService] = useState(() => new TableService(token));
  
  const [expandedSections, setExpandedSections] = useState({
    myusta: true,
    chat: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTables, setFilteredTables] = useState({ myusta: [], chat: [] });
  const [backendStatus, setBackendStatus] = useState({
    myusta: 'unknown',
    chat: 'unknown'
  });
  const [contextMenu, setContextMenu] = useState(null);
  const [exportProgress, setExportProgress] = useState({});
  const contextMenuRef = useRef(null);

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    // Filter tables based on search term
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

    // Update backend status based on data availability
    setBackendStatus({
      myusta: (tables.myusta?.length > 0) ? 'connected' : (error ? 'error' : 'loading'),
      chat: (tables.chat?.length > 0) ? 'connected' : 'disconnected'
    });
  }, [tables, searchTerm, error]);

  // Close context menu when clicking outside
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

    openWindow({
      type: WINDOW_TYPES.TABLE_DATA,
      title: `${table.displayName} - Data`,
      table: table,
      data: { 
        page: 1, 
        size: 20, 
        search: '', 
        filters: {} 
      }
    });
  };

  const handleTableRightClick = (e, table) => {
    e.preventDefault();
    
    const contextMenuElement = document.createElement('div');
    contextMenuElement.className = 'fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50';
    contextMenuElement.style.left = `${e.clientX}px`;
    contextMenuElement.style.top = `${e.clientY}px`;
    
    const menuOptions = [
      {
        label: 'View Data',
        icon: Eye,
        action: () => handleTableClick(table)
      },
      {
        label: 'View Structure',
        icon: Layers,
        action: () => {
          if (onTableSelect) onTableSelect();
          openWindow({
            type: WINDOW_TYPES.TABLE_SCHEMA,
            title: `${table.displayName} - Structure`,
            table: table
          });
        }
      },
      {
        label: 'Table Info',
        icon: Info,
        action: () => {
          if (onTableSelect) onTableSelect();
          openWindow({
            type: WINDOW_TYPES.TABLE_SCHEMA,
            title: `${table.displayName} - Information`,
            table: table,
            data: { activeTab: 'info' }
          });
        }
      }
    ];

    menuOptions.forEach(option => {
      const menuItem = document.createElement('div');
      menuItem.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 text-sm';
      menuItem.innerHTML = `
        <span class="w-4 h-4">${option.icon.name}</span>
        <span>${option.label}</span>
      `;
      menuItem.onclick = () => {
        option.action();
        document.body.removeChild(contextMenuElement);
      };
      contextMenuElement.appendChild(menuItem);
    });

    const removeMenu = () => {
      if (document.body.contains(contextMenuElement)) {
        document.body.removeChild(contextMenuElement);
      }
      document.removeEventListener('click', removeMenu);
    };

    document.addEventListener('click', removeMenu);
    document.body.appendChild(contextMenuElement);
  };

  // Database context menu handler
  const handleDatabaseContextMenu = (e, backend) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      backend,
      x: e.clientX,
      y: e.clientY,
      tables: backend === 'myusta' ? filteredTables.myusta : filteredTables.chat
    });
  };

  // Export all table data
  const exportAllData = async (backend, tables) => {
    try {
      setExportProgress({ [backend]: 'Exporting data...' });
      
      const allData = {};
      const errors = [];

      // Fetch data from all tables
      for (const table of tables) {
        try {
          console.log(`Exporting data from ${table.name}...`);
          const result = await tableService.getTableData(table, {
            page: 1,
            size: 1000, // Get maximum records
            search: '',
            sortBy: 'id',
            sortOrder: 'ASC'
          });

          if (result.success) {
            allData[table.name] = {
              tableName: table.tableName,
              displayName: table.displayName,
              recordCount: result.records.length,
              data: result.records,
              exportedAt: new Date().toISOString()
            };
          } else {
            errors.push(`${table.name}: ${result.error}`);
          }
        } catch (error) {
          errors.push(`${table.name}: ${error.message}`);
        }
      }

      // Create export object
      const exportData = {
        database: backend,
        exportType: 'data',
        exportedAt: new Date().toISOString(),
        tableCount: Object.keys(allData).length,
        totalRecords: Object.values(allData).reduce((sum, table) => sum + table.recordCount, 0),
        tables: allData,
        errors: errors.length > 0 ? errors : undefined
      };

      // Download as JSON
      downloadJSON(exportData, `${backend}_database_export_${formatDate()}.json`);
      
      setExportProgress({ [backend]: `✅ Exported ${Object.keys(allData).length} tables` });
      setTimeout(() => setExportProgress({}), 3000);
      
    } catch (error) {
      console.error('Export failed:', error);
      setExportProgress({ [backend]: `❌ Export failed: ${error.message}` });
      setTimeout(() => setExportProgress({}), 5000);
    }
  };

  // Export all table schemas
  const exportAllSchemas = async (backend, tables) => {
    try {
      setExportProgress({ [backend]: 'Exporting schemas...' });
      
      const allSchemas = {};
      const errors = [];

      // Fetch schema from all tables
      for (const table of tables) {
        try {
          console.log(`Exporting schema from ${table.name}...`);
          const result = await tableService.getTableSchema(table);

          if (result.success) {
            allSchemas[table.name] = {
              tableName: table.tableName,
              displayName: table.displayName,
              model: result.model,
              attributes: result.attributes,
              associations: result.associations,
              statistics: {
                attributeCount: result.attributes?.length || 0,
                associationCount: result.associations?.length || 0,
                requiredFields: result.attributes?.filter(attr => !attr.allowNull).length || 0,
                uniqueFields: result.attributes?.filter(attr => attr.unique).length || 0,
                primaryKey: result.attributes?.find(attr => attr.primaryKey)?.name || 'id'
              },
              exportedAt: new Date().toISOString()
            };
          } else {
            errors.push(`${table.name}: ${result.error}`);
          }
        } catch (error) {
          errors.push(`${table.name}: ${error.message}`);
        }
      }

      // Create export object
      const exportSchema = {
        database: backend,
        exportType: 'schema',
        exportedAt: new Date().toISOString(),
        tableCount: Object.keys(allSchemas).length,
        totalAttributes: Object.values(allSchemas).reduce((sum, table) => sum + (table.statistics.attributeCount || 0), 0),
        totalAssociations: Object.values(allSchemas).reduce((sum, table) => sum + (table.statistics.associationCount || 0), 0),
        tables: allSchemas,
        errors: errors.length > 0 ? errors : undefined
      };

      // Download as JSON
      downloadJSON(exportSchema, `${backend}_schema_export_${formatDate()}.json`);
      
      setExportProgress({ [backend]: `✅ Exported ${Object.keys(allSchemas).length} schemas` });
      setTimeout(() => setExportProgress({}), 3000);
      
    } catch (error) {
      console.error('Schema export failed:', error);
      setExportProgress({ [backend]: `❌ Schema export failed: ${error.message}` });
      setTimeout(() => setExportProgress({}), 5000);
    }
  };

  // Helper function to download JSON
  const downloadJSON = (data, filename) => {
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
  };

  // Helper function to format date for filename
  const formatDate = () => {
    return new Date().toISOString().split('T')[0].replace(/-/g, '');
  };

  const getBackendIcon = (backend) => {
    return backend === BACKEND_TYPES.MYUSTA ? 
      <Database className="w-4 h-4" /> : 
      <Server className="w-4 h-4" />;
  };

  const getBackendColor = (backend) => {
    return backend === BACKEND_TYPES.MYUSTA ? 'text-blue-600' : 'text-emerald-600';
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
      onContextMenu={(e) => handleTableRightClick(e, table)}
      className="group flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
      title={`Table: ${table.tableName}\nAttributes: ${table.attributes?.length || 0}\nAssociations: ${table.associations?.length || 0}${table.isMock ? '\n[Mock Data]' : ''}`}
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
          {table.isMock && <span className="text-orange-500">• Mock</span>}
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Settings className="w-3 h-3 text-gray-400" />
      </div>
    </div>
  );

  const DatabaseSection = ({ title, icon, tables, backend, expanded, onToggle, status }) => (
    <div className="mb-3">
      <div className="relative">
        <button
          onClick={onToggle}
          onContextMenu={(e) => handleDatabaseContextMenu(e, backend)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors group"
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDatabaseContextMenu(e, backend);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                title="Database options"
              >
                <MoreVertical className="w-3 h-3 text-gray-500" />
              </button>
            )}
            {!isCollapsed && (
              expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )
            )}
          </div>
        </button>

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
              {status === 'loading' ? 'Loading...' : 
               status === 'error' ? 'Connection failed' :
               status === 'disconnected' ? 'Backend not available' :
               'No tables available'}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Context Menu Component
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
        {/* Header */}
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

        {/* Export Options */}
        <div className="py-1">
          <button
            onClick={() => {
              exportAllData(contextMenu.backend, contextMenu.tables);
              setContextMenu(null);
            }}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
            disabled={!!exportProgress[contextMenu.backend]}
          >
            <Download className="w-4 h-4 text-blue-600" />
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">Export All Data</div>
              <div className="text-xs text-gray-500">Download table records as JSON</div>
            </div>
          </button>

          <button
            onClick={() => {
              exportAllSchemas(contextMenu.backend, contextMenu.tables);
              setContextMenu(null);
            }}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
            disabled={!!exportProgress[contextMenu.backend]}
          >
            <DatabaseIcon className="w-4 h-4 text-green-600" />
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">Export All Schemas</div>
              <div className="text-xs text-gray-500">Download table structures as JSON</div>
            </div>
          </button>

          <button
            onClick={() => {
              exportAllData(contextMenu.backend, contextMenu.tables);
              setTimeout(() => {
                exportAllSchemas(contextMenu.backend, contextMenu.tables);
              }, 1000);
              setContextMenu(null);
            }}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
            disabled={!!exportProgress[contextMenu.backend]}
          >
            <Package className="w-4 h-4 text-purple-600" />
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">Export Complete Database</div>
              <div className="text-xs text-gray-500">Download both data and schemas</div>
            </div>
          </button>
        </div>

        {/* Cancel */}
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

  if (loading && (!tables.myusta?.length && !tables.chat?.length)) {
    return (
      <div className={`${isCollapsed ? 'w-12' : 'w-80'} bg-white shadow-md border-r border-gray-200 p-4 transition-all duration-300`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${isCollapsed ? 'w-12' : 'w-80'} bg-white shadow-md border-r border-gray-200 flex flex-col h-full transition-all duration-300`}>
        {/* Header with collapse toggle */}
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
          
          {/* Search - only when expanded */}
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

        {/* Error Display */}
        {!isCollapsed && error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <div className="font-medium">Connection Error</div>
                <div className="text-xs mt-1">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Database Sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* MyUsta Database */}
          <DatabaseSection
            title="MyUsta Database"
            icon={<Database className="w-4 h-4" />}
            tables={filteredTables.myusta}
            backend={BACKEND_TYPES.MYUSTA}
            expanded={expandedSections.myusta}
            onToggle={() => toggleSection('myusta')}
            status={backendStatus.myusta}
          />

          {/* Chat Database */}
          <DatabaseSection
            title="Chat Database"
            icon={<Server className="w-4 h-4" />}
            tables={filteredTables.chat}
            backend={BACKEND_TYPES.CHAT}
            expanded={expandedSections.chat}
            onToggle={() => toggleSection('chat')}
            status={backendStatus.chat}
          />
        </div>

        {/* Footer - only when expanded */}
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
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-medium">MyUsta: {filteredTables.myusta.length}</span>
                <span className="text-emerald-600 font-medium">Chat: {filteredTables.chat.length}</span>
              </div>
              {searchTerm && (
                <div className="text-blue-600">
                  Filtered by: "{searchTerm}"
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 text-center">
                <button
                  onClick={fetchTables}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50 text-xs"
                >
                  {loading ? 'Refreshing...' : 'Refresh Tables'}
                </button>
              </div>
              <div className="text-center text-xs text-gray-400 mt-2">
                Right-click database names for export options
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      <ContextMenu />
    </>
  );
};

export default DatabaseSidebar;