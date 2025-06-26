// src/context/WindowContext.js - Updated with full area maximization
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
  cascadeOffset: 0,
  sidebarWidth: 320 // Default sidebar width
};

const windowReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SIDEBAR_WIDTH':
      return {
        ...state,
        sidebarWidth: action.payload.width
      };

    case 'OPEN_WINDOW':
      const containerWidth = window.innerWidth - state.sidebarWidth;
      const containerHeight = window.innerHeight - 100; // Account for header/taskbar
      
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
        zIndex: Date.now(),
        containerWidth,
        containerHeight
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
      const containerWidtht = window.innerWidth - state.sidebarWidth;
      const containerHeightt = window.innerHeight - 100;
      
      return {
        ...state,
        windows: state.windows.map(window =>
          window.id === action.payload.windowId
            ? { 
              ...window, 
              isMaximized: !window.isMaximized, 
              isMinimized: false,
              ...(window.isMaximized 
                ? { 
                  position: window.originalPosition || { x: 50, y: 50 }, 
                  size: window.originalSize || { width: 800, height: 600 }
                }
                : { 
                  originalPosition: window.position, 
                  originalSize: window.size,
                  position: { x: 0, y: 0 },
                  size: { width: containerWidtht, height: containerHeightt }
                }
              ),
              containerWidtht,
              containerHeightt
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
      const cascadeContainerWidth = window.innerWidth - state.sidebarWidth;
      const cascadeContainerHeight = window.innerHeight - 100;
      
      return {
        ...state,
        windows: state.windows.map((window, index) => ({
          ...window,
          position: {
            x: 50 + index * 30,
            y: 50 + index * 30
          },
          isMinimized: false,
          isMaximized: false,
          containerWidth: cascadeContainerWidth,
          containerHeight: cascadeContainerHeight
        })),
        cascadeOffset: state.windows.length
      };

    case 'TILE_WINDOWS':
      const windowCount = state.windows.length;
      if (windowCount === 0) return state;

      const tileContainerWidth = window.innerWidth - state.sidebarWidth;
      const tileContainerHeight = window.innerHeight - 100;
      
      const cols = Math.ceil(Math.sqrt(windowCount));
      const rows = Math.ceil(windowCount / cols);
      const windowWidth = Math.floor(tileContainerWidth / cols);
      const windowHeight = Math.floor(tileContainerHeight / rows);

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
            isMaximized: false,
            containerWidth: tileContainerWidth,
            containerHeight: tileContainerHeight
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

    case 'UPDATE_CONTAINER_SIZE':
      const updatedContainerWidth = window.innerWidth - state.sidebarWidth;
      const updatedContainerHeight = window.innerHeight - 100;
      
      return {
        ...state,
        windows: state.windows.map(window => ({
          ...window,
          containerWidth: updatedContainerWidth,
          containerHeight: updatedContainerHeight
        }))
      };

    default:
      return state;
  }
};

export const WindowProvider = ({ children }) => {
  const [state, dispatch] = useReducer(windowReducer, initialState);

  // Update sidebar width for window calculations
  const setSidebarWidth = (width) => {
    dispatch({ type: 'SET_SIDEBAR_WIDTH', payload: { width } });
    // Also update existing windows' container size
    dispatch({ type: 'UPDATE_CONTAINER_SIZE' });
  };

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

  // Update container size when window resizes
  React.useEffect(() => {
    const handleResize = () => {
      dispatch({ type: 'UPDATE_CONTAINER_SIZE' });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    setSidebarWidth,
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