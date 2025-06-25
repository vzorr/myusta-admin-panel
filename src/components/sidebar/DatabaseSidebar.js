// src/components/sidebar/DatabaseSidebar.js
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
  Settings
} from 'lucide-react';
import { useTable } from '../../context/TableContext';
import { useWindows, WINDOW_TYPES } from '../../context/WindowContext';
import { BACKEND_TYPES } from '../../utils/constants';

const DatabaseSidebar = () => {
  const { tables, loading, fetchTables, error } = useTable();
  const { openWindow } = useWindows();
  const [expandedSections, setExpandedSections] = useState({
    myusta: true,
    chat: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTables, setFilteredTables] = useState({ myusta: [], chat: [] });

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
  }, [tables, searchTerm]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTableClick = (table) => {
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
        action: () => openWindow({
          type: WINDOW_TYPES.TABLE_SCHEMA,
          title: `${table.displayName} - Structure`,
          table: table
        })
      },
      {
        label: 'Table Info',
        icon: Info,
        action: () => openWindow({
          type: WINDOW_TYPES.TABLE_SCHEMA,
          title: `${table.displayName} - Information`,
          table: table,
          data: { activeTab: 'info' }
        })
      }
    ];

    menuOptions.forEach(option => {
      const menuItem = document.createElement('div');
      menuItem.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2';
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

  const TableItem = ({ table }) => (
    <div
      onClick={() => handleTableClick(table)}
      onContextMenu={(e) => handleTableRightClick(e, table)}
      className="group flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
      title={`Table: ${table.tableName}\nAttributes: ${table.attributes?.length || 0}\nAssociations: ${table.associations?.length || 0}`}
    >
      <Table className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">
          {table.displayName}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {table.tableName} • {table.attributes?.length || 0} fields
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Settings className="w-3 h-3 text-gray-400" />
      </div>
    </div>
  );

  const DatabaseSection = ({ title, icon, tables, backend, expanded, onToggle }) => (
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
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {tables.length}
          </span>
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
              No tables available
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
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">!</span>
            </div>
            <span className="text-sm text-red-700">{error}</span>
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
        />

        {/* Chat Database */}
        <DatabaseSection
          title="Chat Database"
          icon={<Server className="w-4 h-4" />}
          tables={filteredTables.chat}
          backend={BACKEND_TYPES.CHAT}
          expanded={expandedSections.chat}
          onToggle={() => toggleSection('chat')}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Total: {(filteredTables.myusta.length + filteredTables.chat.length)} tables</div>
          <div className="flex items-center justify-between">
            <span>MyUsta: {filteredTables.myusta.length}</span>
            <span>Chat: {filteredTables.chat.length}</span>
          </div>
          {searchTerm && (
            <div className="text-blue-600">
              Filtered by: "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseSidebar;