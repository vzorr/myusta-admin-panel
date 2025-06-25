// src/context/TableContext.js
import React, { createContext, useContext, useReducer } from 'react';
import TableService from '../services/tableService';
import { useAuth } from './AuthContext';

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
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'SET_TABLES':
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
      return state;
  }
};

export const TableProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tableReducer, initialState);
  const { token } = useAuth();

  const tableService = new TableService(token);

  const fetchTables = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const tablesData = await tableService.getTables();
      dispatch({ type: 'SET_TABLES', payload: tablesData });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const selectTable = (table) => {
    dispatch({ type: 'SET_SELECTED_TABLE', payload: table });
  };

  const fetchTableData = async (table, options = {}) => {
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
  };

  const searchGlobal = async (searchTerm) => {
    if (!searchTerm.trim()) {
      dispatch({ type: 'CLEAR_SEARCH' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      // Get all available tables
      const allTables = [
        ...state.tables.myusta,
        ...state.tables.chat
      ];
      
      const results = await tableService.searchGlobal(searchTerm, allTables);
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const getTableSchema = async (table) => {
    try {
      const result = await tableService.getTableSchema(table);
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const getRecord = async (table, recordId) => {
    try {
      const result = await tableService.getRecord(table, recordId);
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const updateRecord = async (table, recordId, data) => {
    try {
      const result = await tableService.updateRecord(table, recordId, data);
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const deleteRecord = async (table, recordId) => {
    try {
      const result = await tableService.deleteRecord(table, recordId);
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const createRecord = async (table, data) => {
    try {
      const result = await tableService.createRecord(table, data);
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearSearch = () => {
    dispatch({ type: 'CLEAR_SEARCH' });
  };

  // Helper methods
  const getAllTables = () => {
    return [
      ...state.tables.myusta,
      ...state.tables.chat
    ];
  };

  const getTableByName = (name, backend) => {
    const tables = backend === 'myusta' ? state.tables.myusta : state.tables.chat;
    return tables.find(table => table.name === name);
  };

  const getTablesCount = () => {
    return {
      myusta: state.tables.myusta.length,
      chat: state.tables.chat.length,
      total: state.tables.myusta.length + state.tables.chat.length
    };
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