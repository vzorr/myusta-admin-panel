// src/components/windows/windowUtils.js
import { WINDOW_TYPES, WINDOW_DEFAULTS } from '../../utils/constants';

/**
 * Get window type icon
 */
export const getWindowTypeIcon = (type) => {
  const icons = {
    [WINDOW_TYPES.TABLE_DATA]: '📊',
    [WINDOW_TYPES.TABLE_SCHEMA]: '🏗️',
    [WINDOW_TYPES.RECORD_DETAIL]: '📝',
    [WINDOW_TYPES.SEARCH_RESULTS]: '🔍',
    [WINDOW_TYPES.CREATE_RECORD]: '➕'
  };
  return icons[type] || '📋';
};

/**
 * Get window type name
 */
export const getWindowTypeName = (type) => {
  const names = {
    [WINDOW_TYPES.TABLE_DATA]: 'Data View',
    [WINDOW_TYPES.TABLE_SCHEMA]: 'Schema View',
    [WINDOW_TYPES.RECORD_DETAIL]: 'Record Detail',
    [WINDOW_TYPES.SEARCH_RESULTS]: 'Search Results',
    [WINDOW_TYPES.CREATE_RECORD]: 'Create Record'
  };
  return names[type] || 'Unknown';
};

/**
 * Get default window size for type
 */
export const getWindowDefaultSize = (type) => {
  return WINDOW_DEFAULTS[type] || WINDOW_DEFAULTS.TABLE_DATA;
};

/**
 * Calculate optimal window position to avoid overlap
 */
export const calculateWindowPosition = (existingWindows, windowSize, containerSize) => {
  const cascade = {
    offsetX: 30,
    offsetY: 30,
    startX: 50,
    startY: 50
  };

  const windowCount = existingWindows.length;
  const maxCascade = Math.floor(Math.min(
    (containerSize.width - windowSize.width - cascade.startX) / cascade.offsetX,
    (containerSize.height - windowSize.height - cascade.startY) / cascade.offsetY
  ));

  const cascadeIndex = windowCount % (maxCascade + 1);

  return {
    x: cascade.startX + (cascadeIndex * cascade.offsetX),
    y: cascade.startY + (cascadeIndex * cascade.offsetY)
  };
};

/**
 * Calculate tile positions for windows
 */
export const calculateTilePositions = (windows, containerSize) => {
  const windowCount = windows.length;
  if (windowCount === 0) return [];

  const cols = Math.ceil(Math.sqrt(windowCount));
  const rows = Math.ceil(windowCount / cols);
  
  const windowWidth = Math.floor(containerSize.width / cols);
  const windowHeight = Math.floor(containerSize.height / rows);

  return windows.map((window, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    return {
      id: window.id,
      position: {
        x: col * windowWidth,
        y: row * windowHeight
      },
      size: {
        width: windowWidth - 10, // Small gap between windows
        height: windowHeight - 10
      }
    };
  });
};

/**
 * Check if window is within container bounds
 */
export const isWindowInBounds = (window, containerSize) => {
  const { position, size } = window;
  
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + size.width <= containerSize.width &&
    position.y + size.height <= containerSize.height
  );
};

/**
 * Constrain window position to container bounds
 */
export const constrainWindowToBounds = (window, containerSize) => {
  const { position, size } = window;
  
  const constrainedX = Math.max(0, Math.min(position.x, containerSize.width - size.width));
  const constrainedY = Math.max(0, Math.min(position.y, containerSize.height - size.height));
  
  return {
    ...window,
    position: {
      x: constrainedX,
      y: constrainedY
    }
  };
};

/**
 * Generate unique window title
 */
export const generateWindowTitle = (type, table, existingTitles = []) => {
  let baseTitle;
  
  switch (type) {
    case WINDOW_TYPES.TABLE_DATA:
      baseTitle = table ? `${table.displayName} - Data` : 'Table Data';
      break;
    case WINDOW_TYPES.TABLE_SCHEMA:
      baseTitle = table ? `${table.displayName} - Schema` : 'Table Schema';
      break;
    case WINDOW_TYPES.RECORD_DETAIL:
      baseTitle = table ? `${table.displayName} - Record` : 'Record Detail';
      break;
    case WINDOW_TYPES.SEARCH_RESULTS:
      baseTitle = 'Search Results';
      break;
    case WINDOW_TYPES.CREATE_RECORD:
      baseTitle = table ? `Create ${table.displayName}` : 'Create Record';
      break;
    default:
      baseTitle = 'Window';
  }

  // If title doesn't exist, return it
  if (!existingTitles.includes(baseTitle)) {
    return baseTitle;
  }

  // Find unique title by adding number
  let counter = 2;
  let uniqueTitle = `${baseTitle} (${counter})`;
  
  while (existingTitles.includes(uniqueTitle)) {
    counter++;
    uniqueTitle = `${baseTitle} (${counter})`;
  }
  
  return uniqueTitle;
};

/**
 * Get window configuration for opening
 */
export const createWindowConfig = (type, table, data = {}, existingWindows = []) => {
  const containerSize = {
    width: window.innerWidth - 320, // Account for sidebar
    height: window.innerHeight - 100 // Account for header/taskbar
  };

  const defaultSize = getWindowDefaultSize(type);
  const position = calculateWindowPosition(existingWindows, defaultSize, containerSize);
  const existingTitles = existingWindows.map(w => w.title);
  const title = generateWindowTitle(type, table, existingTitles);

  return {
    type,
    title,
    table,
    data,
    position,
    size: defaultSize,
    isMinimized: false,
    isMaximized: false
  };
};

/**
 * Window keyboard shortcuts
 */
export const handleWindowKeyboard = (event, windowActions) => {
  const { ctrlKey, altKey, shiftKey, key } = event;
  
  // Ctrl+W - Close active window
  if (ctrlKey && key === 'w') {
    event.preventDefault();
    windowActions.closeActiveWindow();
    return true;
  }
  
  // Ctrl+Shift+W - Close all windows
  if (ctrlKey && shiftKey && key === 'W') {
    event.preventDefault();
    windowActions.closeAllWindows();
    return true;
  }
  
  // Alt+Tab - Cycle through windows
  if (altKey && key === 'Tab') {
    event.preventDefault();
    windowActions.cycleWindows();
    return true;
  }
  
  // Ctrl+M - Minimize active window
  if (ctrlKey && key === 'm') {
    event.preventDefault();
    windowActions.minimizeActiveWindow();
    return true;
  }
  
  // F11 - Toggle maximize active window
  if (key === 'F11') {
    event.preventDefault();
    windowActions.toggleMaximizeActiveWindow();
    return true;
  }
  
  return false;
};

/**
 * Window storage utilities for persistence
 */
export const windowStorageUtils = {
  STORAGE_KEY: 'myusta_admin_windows',
  
  saveWindowsState: (windows) => {
    try {
      const state = windows.map(window => ({
        id: window.id,
        type: window.type,
        title: window.title,
        position: window.position,
        size: window.size,
        isMinimized: window.isMinimized,
        isMaximized: window.isMaximized,
        table: window.table ? {
          name: window.table.name,
          backend: window.table.backend
        } : null
      }));
      
      localStorage.setItem(windowStorageUtils.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save windows state:', error);
    }
  },
  
  loadWindowsState: () => {
    try {
      const saved = localStorage.getItem(windowStorageUtils.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load windows state:', error);
      return [];
    }
  },
  
  clearWindowsState: () => {
    localStorage.removeItem(windowStorageUtils.STORAGE_KEY);
  }
};