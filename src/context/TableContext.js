// src/context/TableContext.js - Enhanced with detailed logging
import React, { createContext, useContext, useReducer } from 'react';
import TableService from '../services/tableService';
import { useAuth } from './AuthContext';
import logger from '../utils/logger';

const TableContext = createContext(null);

const initialState = {
  tables: {
    myusta: [],
    chat: []
  },
  selectedTable: null,
  data: [],
  loading: false,
  error: null,
  searchResults: []
};

const tableReducer = (state, action) => {
  logger.debug('TableContext reducer', {
    action: action.type,
    payload: action.payload,
    currentState: {
      myustaTablesCount: state.tables.myusta.length,
      chatTablesCount: state.tables.chat.length,
      loading: state.loading,
      hasError: !!state.error
    }
  }, 'REDUCER');

  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      logger.error('TableContext error set', action.payload);
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'SET_TABLES':
      logger.success('Tables set in context', {
        myustaCount: action.payload.myusta?.length || 0,
        chatCount: action.payload.chat?.length || 0,
        myustaTables: action.payload.myusta?.map(t => t.name) || [],
        chatTables: action.payload.chat?.map(t => t.name) || []
      });
      return {
        ...state,
        tables: action.payload,
        loading: false
      };
    case 'SET_SELECTED_TABLE':
      logger.table('Table selected', {
        tableName: action.payload?.name,
        backend: action.payload?.backend
      });
      return {
        ...state,
        selectedTable: action.payload
      };
    case 'SET_TABLE_DATA':
      logger.success('Table data set', {
        recordsCount: action.payload?.length || 0
      });
      return {
        ...state,
        data: action.payload,
        loading: false
      };
    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      logger.info('Error cleared from context');
      return {
        ...state,
        error: null
      };
    case 'CLEAR_SEARCH':
      return {
        ...state,
        searchResults: []
      };
    default:
      logger.warn('Unknown action type in TableContext', action.type);
      return state;
  }
};

export const TableProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tableReducer, initialState);
  const { token } = useAuth();

  logger.table('TableProvider initialized', {
    hasToken: !!token,
    tokenLength: token?.length || 0
  }, 'PROVIDER');

  const tableService = new TableService(token);

  const fetchTables = async () => {
    logger.separator('FETCH TABLES INITIATED');
    logger.table('Starting fetchTables', {
      hasToken: !!token,
      currentTablesCount: {
        myusta: state.tables.myusta.length,
        chat: state.tables.chat.length
      }
    });

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      logger.time('fetchTables');
      const tablesData = await tableService.getTables();
      logger.timeEnd('fetchTables');
      
      logger.success('Tables fetched successfully', {
        myustaCount: tablesData.myusta?.length || 0,
        chatCount: tablesData.chat?.length || 0,
        totalCount: (tablesData.myusta?.length || 0) + (tablesData.chat?.length || 0)
      });
      
      dispatch({ type: 'SET_TABLES', payload: tablesData });
    } catch (error) {
      logger.error('Failed to fetch tables', {
        error: error.message,
        stack: error.stack
      });
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const selectTable = (table) => {
    logger.table('Selecting table', {
      tableName: table?.name,
      backend: table?.backend,
      hasAttributes: !!table?.attributes?.length
    });
    dispatch({ type: 'SET_SELECTED_TABLE', payload: table });
  };

  const fetchTableData = async (table, options = {}) => {
    logger.table('Fetching table data', {
      tableName: table?.name,
      backend: table?.backend,
      options
    });

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      logger.time(`fetchTableData-${table.name}`);
      const result = await tableService.getTableData(table, options);
      logger.timeEnd(`fetchTableData-${table.name}`);
      
      if (result.success) {
        logger.success('Table data fetched successfully', {
          recordsCount: result.records?.length || 0,
          pagination: result.pagination
        });
        dispatch({ type: 'SET_TABLE_DATA', payload: result.records });
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      logger.error('Failed to fetch table data', {
        tableName: table?.name,
        error: error.message
      });
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const searchGlobal = async (searchTerm) => {
    if (!searchTerm.trim()) {
      logger.debug('Clearing search - empty search term');
      dispatch({ type: 'CLEAR_SEARCH' });
      return;
    }

    logger.table('Starting global search', { searchTerm });

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      // Get all available tables
      const allTables = [
        ...state.tables.myusta,
        ...state.tables.chat
      ];
      
      logger.debug('Search across tables', {
        searchTerm,
        tablesCount: allTables.length,
        tableNames: allTables.map(t => t.name)
      });
      
      const results = await tableService.searchGlobal(searchTerm, allTables);
      
      logger.success('Global search completed', {
        resultsCount: results?.length || 0
      });
      
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
    } catch (error) {
      logger.error('Global search failed', error.message);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const getTableSchema = async (table) => {
    logger.table('Getting table schema', {
      tableName: table?.name,
      backend: table?.backend
    });

    try {
      const result = await tableService.getTableSchema(table);
      
      if (result.success) {
        logger.success('Table schema retrieved', {
          attributesCount: result.attributes?.length || 0,
          associationsCount: result.associations?.length || 0
        });
      } else {
        logger.error('Failed to get table schema', result.error);
      }
      
      return result;
    } catch (error) {
      logger.error('Table schema error', error.message);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const getRecord = async (table, recordId) => {
    logger.table('Getting record', {
      tableName: table?.name,
      recordId,
      backend: table?.backend
    });

    try {
      const result = await tableService.getRecord(table, recordId);
      
      if (result.success) {
        logger.success('Record retrieved', { recordId });
      } else {
        logger.error('Failed to get record', result.error);
      }
      
      return result;
    } catch (error) {
      logger.error('Get record error', error.message);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const updateRecord = async (table, recordId, data) => {
    logger.table('Updating record', {
      tableName: table?.name,
      recordId,
      updateFields: Object.keys(data || {})
    });

    try {
      const result = await tableService.updateRecord(table, recordId, data);
      
      if (result.success) {
        logger.success('Record updated', { recordId });
      } else {
        logger.error('Failed to update record', result.error);
      }
      
      return result;
    } catch (error) {
      logger.error('Update record error', error.message);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const deleteRecord = async (table, recordId) => {
    logger.table('Deleting record', {
      tableName: table?.name,
      recordId
    });

    try {
      const result = await tableService.deleteRecord(table, recordId);
      
      if (result.success) {
        logger.success('Record deleted', { recordId });
      } else {
        logger.error('Failed to delete record', result.error);
      }
      
      return result;
    } catch (error) {
      logger.error('Delete record error', error.message);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const createRecord = async (table, data) => {
    logger.table('Creating record', {
      tableName: table?.name,
      fields: Object.keys(data || {})
    });

    try {
      const result = await tableService.createRecord(table, data);
      
      if (result.success) {
        logger.success('Record created');
      } else {
        logger.error('Failed to create record', result.error);
      }
      
      return result;
    } catch (error) {
      logger.error('Create record error', error.message);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const clearError = () => {
    logger.info('Clearing error from TableContext');
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearSearch = () => {
    logger.info('Clearing search results');
    dispatch({ type: 'CLEAR_SEARCH' });
  };

  // Helper methods
  const getAllTables = () => {
    const allTables = [
      ...state.tables.myusta,
      ...state.tables.chat
    ];
    
    logger.debug('Getting all tables', {
      totalCount: allTables.length,
      myustaCount: state.tables.myusta.length,
      chatCount: state.tables.chat.length
    });
    
    return allTables;
  };

  const getTableByName = (name, backend) => {
    const tables = backend === 'myusta' ? state.tables.myusta : state.tables.chat;
    const table = tables.find(table => table.name === name);
    
    logger.debug('Getting table by name', {
      name,
      backend,
      found: !!table
    });
    
    return table;
  };

  const getTablesCount = () => {
    const counts = {
      myusta: state.tables.myusta.length,
      chat: state.tables.chat.length,
      total: state.tables.myusta.length + state.tables.chat.length
    };
    
    logger.debug('Tables count', counts);
    return counts;
  };

  const value = {
    ...state,
    fetchTables,
    selectTable,
    fetchTableData,
    searchGlobal,
    getTableSchema,
    getRecord,
    updateRecord,
    deleteRecord,
    createRecord,
    clearError,
    clearSearch,
    getAllTables,
    getTableByName,
    getTablesCount
  };

  return (
    <TableContext.Provider value={value}>
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
};

export default TableContext;