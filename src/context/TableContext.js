// src/context/TableContext.js
import React, { createContext, useContext, useReducer } from 'react';
import TableService from '../services/tableService';
import { useAuth } from './AuthContext';

const TableContext = createContext(null);

const initialState = {
  tables: [],
  selectedTable: null,
  data: [],
  loading: false,
  error: null,
  editingRow: null,
  editData: {}
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
        selectedTable: action.payload,
        editingRow: null,
        editData: {}
      };
    case 'SET_TABLE_DATA':
      return {
        ...state,
        data: action.payload,
        loading: false
      };
    case 'SET_EDITING_ROW':
      return {
        ...state,
        editingRow: action.payload.id,
        editData: action.payload.data
      };
    case 'UPDATE_EDIT_DATA':
      return {
        ...state,
        editData: {
          ...state.editData,
          [action.payload.field]: action.payload.value
        }
      };
    case 'CANCEL_EDITING':
      return {
        ...state,
        editingRow: null,
        editData: {}
      };
    case 'UPDATE_ROW':
      return {
        ...state,
        data: state.data.map(row =>
          row.id === action.payload.id
            ? { ...row, ...action.payload.data }
            : row
        ),
        editingRow: null,
        editData: {}
      };
    case 'DELETE_ROW':
      return {
        ...state,
        data: state.data.filter(row => row.id !== action.payload.id)
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
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
    
    try {
      const tables = await tableService.getTables();
      dispatch({ type: 'SET_TABLES', payload: tables });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const selectTable = async (table) => {
    dispatch({ type: 'SET_SELECTED_TABLE', payload: table });
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const data = await tableService.getTableData(table);
      dispatch({ type: 'SET_TABLE_DATA', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const refreshTableData = async () => {
    if (!state.selectedTable) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const data = await tableService.getTableData(state.selectedTable);
      dispatch({ type: 'SET_TABLE_DATA', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const startEditing = (row) => {
    dispatch({
      type: 'SET_EDITING_ROW',
      payload: { id: row.id, data: { ...row } }
    });
  };

  const updateEditData = (field, value) => {
    dispatch({
      type: 'UPDATE_EDIT_DATA',
      payload: { field, value }
    });
  };

  const cancelEditing = () => {
    dispatch({ type: 'CANCEL_EDITING' });
  };

  const saveRow = async (id) => {
    try {
      const response = await tableService.updateRecord(
        state.selectedTable,
        id,
        state.editData
      );
      
      if (response.success) {
        dispatch({
          type: 'UPDATE_ROW',
          payload: { id, data: state.editData }
        });
        return { success: true };
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const deleteRow = async (id) => {
    try {
      const response = await tableService.deleteRecord(
        state.selectedTable,
        id
      );
      
      if (response.success) {
        dispatch({ type: 'DELETE_ROW', payload: { id } });
        return { success: true };
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    fetchTables,
    selectTable,
    refreshTableData,
    startEditing,
    updateEditData,
    cancelEditing,
    saveRow,
    deleteRow,
    clearError
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