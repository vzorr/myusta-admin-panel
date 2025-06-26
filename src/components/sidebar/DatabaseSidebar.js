// src/components/sidebar/DatabaseSidebar.js - Enhanced with mobile support
import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useTable } from '../../context/TableContext';
import { useWindows, WINDOW_TYPES } from '../../context/WindowContext';
import { BACKEND_TYPES } from '../../utils/constants';

const DatabaseSidebar = ({ onTableSelect }) => {
  const { tables, loading, fetchTables, error } = useTable();
  const { openWindow } = useWindows();
  const [expandedSections, setExpandedSections] = useState({
    myusta: true,
    chat: true // Default to expanded for better UX
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTables, setFilteredTables] = useState({ myusta: [], chat: [] });
  const [backendStatus, setBackendStatus] = useState({
    myusta: 'unknown',
    chat: 'unknown'
  });

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTableClick = (table) => {
    // Call parent callback for mobile sidebar close
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
    
    // Create context menu for table options
    const contextMenu = document.createElement('div');
    contextMenu.className = 'fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50';
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;
    
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
        document.body.removeChild(contextMenu);
      };
      contextMenu.appendChild(menuItem);
    });

    // Remove context menu when clicking elsewhere
    const removeMenu = () => {
      if (document.body.contains(contextMenu)) {
        document.body.removeChild(contextMenu);
      }
      document.removeEventListener('click', removeMenu);
    };

    document.addEventListener('click', removeMenu);
    document.body.appendChild(contextMenu);
  };

  const getBackendIcon = (backend) => {
    return backend === BACKEND_TYPES.MYUSTA ? 
      <Database className="w-4 h-4" /> : 
      <Server className="w-4 h-4" />;
  };

  const getBackendColor = (backend) => {
    return backend === BACKEND_TYPES.MYUSTA ? 'text-blue-600' : 'text-green-600';
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
      <Table className="w-4 h-4 text-gray-500 group-hover:text-gray-700 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">
          {table.displayName}
        </div>
        <div className="text-xs text-gray-500 truncate flex items-center space-x-2">
          <span>{table.tableName}</span>
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
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className={getBackendColor(backend)}>
            {icon}
          </div>
          <span>{title}</span>
          <div className="flex items-center space-x-1">
            {getBackendStatusIcon(status)}
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {tables.length}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {expanded && (
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

  if (loading && (!tables.myusta?.length && !tables.chat?.length)) {
    return (
      <div className="w-80 bg-white shadow-md border-r border-gray-200 p-4">
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
    <div className="w-80 bg-white shadow-md border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Database Explorer
        </h2>
        
        {/* Search */}
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
      </div>

      {/* Error Display */}
      {error && (
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

      {/* Footer */}
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
            <span>MyUsta: {filteredTables.myusta.length}</span>
            <span>Chat: {filteredTables.chat.length}</span>
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
        </div>
      </div>
    </div>
  );
};

export default DatabaseSidebar;