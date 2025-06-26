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
  // Reduce logging to prevent console spam
  if (process.env.NODE_ENV === 'development') {
    console.log(`TableContext: ${action.type}`, {
      myustaCount: action.type === 'SET_TABLES' ? action.payload.myusta?.length : state.tables.myusta.length,
      chatCount: action.type === 'SET_TABLES' ? action.payload.chat?.length : state.tables.chat.length,
      loading: action.type === 'SET_LOADING' ? action.payload : state.loading
    });
  }

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
        chatCount: action.payload.chat?.length || 0
      });
      return {
        ...state,
        tables: action.payload,
        loading: false
      };
    case 'SET_SELECTED_TABLE':
      return {
        ...state,
        selectedTable: action.payload
      };
    case 'SET_TABLE_DATA':
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

  // FIXED: Stable tableService reference that doesn't change unless token changes
  const tableService = useMemo(() => {
    if (token) {
      return new TableService(token);
    }
    return null;
  }, [token]);

  // FIXED: Stable fetchTables function - removed state.loading dependency to prevent loops
  const fetchTables = useCallback(async () => {
    if (!tableService) {
      console.warn('No tableService available, skipping fetchTables');
      return;
    }

    console.log('🚀 TableContext: Starting fetchTables');

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const tablesData = await tableService.getTables();
      
      console.log('✅ Tables fetched successfully:', {
        myustaCount: tablesData.myusta?.length || 0,
        chatCount: tablesData.chat?.length || 0
      });
      
      dispatch({ type: 'SET_TABLES', payload: tablesData });
    } catch (error) {
      console.error('❌ Failed to fetch tables:', error.message);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [tableService]); // Only depend on tableService, not loading state

  // Other stable functions
  const selectTable = useCallback((table) => {
    dispatch({ type: 'SET_SELECTED_TABLE', payload: table });
  }, []);

  const fetchTableData = useCallback(async (table, options = {}) => {
    if (!tableService) {
      console.warn('No tableService available for fetchTableData');
      return { success: false, error: 'No service available' };
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const result = await tableService.getTableData(table, options);
      
      if (result.success) {
        dispatch({ type: 'SET_TABLE_DATA', payload: result.records });
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  }, [tableService]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const clearSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' });
  }, []);

  // FIXED: Memoize the context value to prevent unnecessary re-renders
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