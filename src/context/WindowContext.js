// src/context/WindowContext.js
import React, { createContext, useContext, useReducer } from 'react';
import { nanoid } from 'nanoid';

const WindowContext = createContext(null);

// Window types
export const WINDOW_TYPES = {
  TABLE_DATA: 'table_data',
  TABLE_SCHEMA: 'table_schema',
  RECORD_DETAIL: 'record_detail',
  SEARCH_RESULTS: 'search_results'
};

const initialState = {
  windows: [],
  activeWindowId: null,
  cascadeOffset: 0
};

const windowReducer = (state, action) => {
  switch (action.type) {
    case 'OPEN_WINDOW':
      const newWindow = {
        id: action.payload.id || nanoid(),
        type: action.payload.type,
        title: action.payload.title,
        table: action.payload.table,
        data: action.payload.data || null,
        position: action.payload.position || {
          x: 50 + state.cascadeOffset * 30,
          y: 50 + state.cascadeOffset * 30
        },
        size: action.payload.size || { width: 800, height: 600 },
        isMinimized: false,
        isMaximized: false,
        zIndex: Date.now()
      };

      return {
        ...state,
        windows: [...state.windows, newWindow],
        activeWindowId: newWindow.id,
        cascadeOffset: (state.cascadeOffset + 1) % 10
      };

    case 'CLOSE_WINDOW':
      const filteredWindows = state.windows.filter(w => w.id !== action.payload.windowId);
      const newActiveId = filteredWindows.length > 0 
        ? filteredWindows[filteredWindows.length - 1].id 
        : null;

      return {
        ...state,
        windows: filteredWindows,
        activeWindowId: state.activeWindowId === action.payload.windowId ? newActiveId : state.activeWindowId
      };

    case 'SET_ACTIVE_WINDOW':
      return {
        ...state,
        activeWindowId: action.payload.windowId,
        windows: state.windows.map(window =>
          window.id === action.payload.windowId
            ? { ...window, zIndex: Date.now() }
            : window
        )
      };

    case 'UPDATE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(window =>
          window.id === action.payload.windowId
            ? { ...window, ...action.payload.updates }
            : window
        )
      };

    case 'MINIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(window =>
          window.id === action.payload.windowId
            ? { ...window, isMinimized: true, isMaximized: false }
            : window
        )
      };

    case 'MAXIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(window =>
          window.id === action.payload.windowId
            ? { 
              ...window, 
              isMaximized: !window.isMaximized, 
              isMinimized: false,
              ...(window.isMaximized 
                ? { position: window.originalPosition, size: window.originalSize }
                : { 
                  originalPosition: window.position, 
                  originalSize: window.size,
                  position: { x: 0, y: 0 },
                  size: { width: window.parentWidth || 1200, height: window.parentHeight || 800 }
                }
              )
            }
            : window
        )
      };

    case 'RESTORE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(window =>
          window.id === action.payload.windowId
            ? { ...window, isMinimized: false }
            : window
        )
      };

    case 'MOVE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(window =>
          window.id === action.payload.windowId
            ? { ...window, position: action.payload.position }
            : window
        )
      };

    case 'RESIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(window =>
          window.id === action.payload.windowId
            ? { ...window, size: action.payload.size }
            : window
        )
      };

    case 'CASCADE_WINDOWS':
      return {
        ...state,
        windows: state.windows.map((window, index) => ({
          ...window,
          position: {
            x: 50 + index * 30,
            y: 50 + index * 30
          },
          isMinimized: false,
          isMaximized: false
        })),
        cascadeOffset: state.windows.length
      };

    case 'TILE_WINDOWS':
      const windowCount = state.windows.length;
      if (windowCount === 0) return state;

      const cols = Math.ceil(Math.sqrt(windowCount));
      const rows = Math.ceil(windowCount / cols);
      const windowWidth = Math.floor(1200 / cols);
      const windowHeight = Math.floor(800 / rows);

      return {
        ...state,
        windows: state.windows.map((window, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          
          return {
            ...window,
            position: {
              x: col * windowWidth,
              y: row * windowHeight
            },
            size: {
              width: windowWidth - 10,
              height: windowHeight - 10
            },
            isMinimized: false,
            isMaximized: false
          };
        })
      };

    case 'CLOSE_ALL_WINDOWS':
      return {
        ...state,
        windows: [],
        activeWindowId: null,
        cascadeOffset: 0
      };

    case 'UPDATE_WINDOW_DATA':
      return {
        ...state,
        windows: state.windows.map(window =>
          window.id === action.payload.windowId
            ? { ...window, data: { ...window.data, ...action.payload.data } }
            : window
        )
      };

    default:
      return state;
  }
};

export const WindowProvider = ({ children }) => {
  const [state, dispatch] = useReducer(windowReducer, initialState);

  const openWindow = (windowConfig) => {
    dispatch({ type: 'OPEN_WINDOW', payload: windowConfig });
  };

  const closeWindow = (windowId) => {
    dispatch({ type: 'CLOSE_WINDOW', payload: { windowId } });
  };

  const setActiveWindow = (windowId) => {
    dispatch({ type: 'SET_ACTIVE_WINDOW', payload: { windowId } });
  };

  const updateWindow = (windowId, updates) => {
    dispatch({ type: 'UPDATE_WINDOW', payload: { windowId, updates } });
  };

  const minimizeWindow = (windowId) => {
    dispatch({ type: 'MINIMIZE_WINDOW', payload: { windowId } });
  };

  const maximizeWindow = (windowId) => {
    dispatch({ type: 'MAXIMIZE_WINDOW', payload: { windowId } });
  };

  const restoreWindow = (windowId) => {
    dispatch({ type: 'RESTORE_WINDOW', payload: { windowId } });
  };

  const moveWindow = (windowId, position) => {
    dispatch({ type: 'MOVE_WINDOW', payload: { windowId, position } });
  };

  const resizeWindow = (windowId, size) => {
    dispatch({ type: 'RESIZE_WINDOW', payload: { windowId, size } });
  };

  const cascadeWindows = () => {
    dispatch({ type: 'CASCADE_WINDOWS' });
  };

  const tileWindows = () => {
    dispatch({ type: 'TILE_WINDOWS' });
  };

  const closeAllWindows = () => {
    dispatch({ type: 'CLOSE_ALL_WINDOWS' });
  };

  const updateWindowData = (windowId, data) => {
    dispatch({ type: 'UPDATE_WINDOW_DATA', payload: { windowId, data } });
  };

  // Helper methods
  const getWindow = (windowId) => {
    return state.windows.find(w => w.id === windowId);
  };

  const getWindowsByType = (type) => {
    return state.windows.filter(w => w.type === type);
  };

  const getWindowsByTable = (tableName) => {
    return state.windows.filter(w => w.table?.name === tableName);
  };

  const isWindowOpen = (type, tableId) => {
    return state.windows.some(w => w.type === type && w.table?.id === tableId);
  };

  const value = {
    ...state,
    openWindow,
    closeWindow,
    setActiveWindow,
    updateWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    moveWindow,
    resizeWindow,
    cascadeWindows,
    tileWindows,
    closeAllWindows,
    updateWindowData,
    getWindow,
    getWindowsByType,
    getWindowsByTable,
    isWindowOpen
  };

  return (
    <WindowContext.Provider value={value}>
      {children}
    </WindowContext.Provider>
  );
};

export const useWindows = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindows must be used within a WindowProvider');
  }
  return context;
};

export default WindowContext;