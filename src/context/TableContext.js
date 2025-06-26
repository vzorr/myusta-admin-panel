// src/context/TableContext.js - Fixed to prevent re-render loops
import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
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

  logger.table('TableProvider render', {
    hasToken: !!token,
    tokenLength: token?.length || 0
  }, 'PROVIDER');

  // Stable tableService reference
  const tableService = useMemo(() => {
    if (token) {
      return new TableService(token);
    }
    return null;
  }, [token]);

  // Stable fetchTables function with useCallback
  const fetchTables = useCallback(async () => {
    if (!tableService) {
      logger.warn('No tableService available, skipping fetchTables');
      return;
    }

    // Prevent multiple concurrent fetches
    if (state.loading) {
      logger.debug('Fetch already in progress, skipping');
      return;
    }

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
  }, [tableService, token, state.loading]); // Include state.loading to prevent concurrent calls

  // Other stable functions
  const selectTable = useCallback((table) => {
    logger.table('Selecting table', {
      tableName: table?.name,
      backend: table?.backend,
      hasAttributes: !!table?.attributes?.length
    });
    dispatch({ type: 'SET_SELECTED_TABLE', payload: table });
  }, []);

  const fetchTableData = useCallback(async (table, options = {}) => {
    if (!tableService) {
      logger.warn('No tableService available for fetchTableData');
      return { success: false, error: 'No service available' };
    }

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
  }, [tableService]);

  const clearError = useCallback(() => {
    logger.info('Clearing error from TableContext');
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const clearSearch = useCallback(() => {
    logger.info('Clearing search results');
    dispatch({ type: 'CLEAR_SEARCH' });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    ...state,
    fetchTables,
    selectTable,
    fetchTableData,
    clearError,
    clearSearch,
    // Helper methods
    getAllTables: () => [...state.tables.myusta, ...state.tables.chat],
    getTableByName: (name, backend) => {
      const tables = backend === 'myusta' ? state.tables.myusta : state.tables.chat;
      return tables.find(table => table.name === name);
    },
    getTablesCount: () => ({
      myusta: state.tables.myusta.length,
      chat: state.tables.chat.length,
      total: state.tables.myusta.length + state.tables.chat.length
    })
  }), [
    state, 
    fetchTables, 
    selectTable, 
    fetchTableData, 
    clearError, 
    clearSearch
  ]);

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