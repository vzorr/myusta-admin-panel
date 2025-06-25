// src/components/windows/WindowTaskbar.js
import React from 'react';
import { useWindows, WINDOW_TYPES } from '../../context/WindowContext';

const WindowTaskbar = () => {
  const {
    windows,
    activeWindowId,
    setActiveWindow,
    restoreWindow,
    closeWindow,
    cascadeWindows,
    tileWindows,
    closeAllWindows
  } = useWindows();

  if (windows.length === 0) return null;

  const visibleWindows = windows.filter(w => !w.isMinimized);
  const minimizedWindows = windows.filter(w => w.isMinimized);

  const getWindowTypeIcon = (type) => {
    const icons = {
      [WINDOW_TYPES.TABLE_DATA]: '📊',
      [WINDOW_TYPES.TABLE_SCHEMA]: '🏗️',
      [WINDOW_TYPES.RECORD_DETAIL]: '📝',
      [WINDOW_TYPES.SEARCH_RESULTS]: '🔍',
      [WINDOW_TYPES.CREATE_RECORD]: '➕'
    };
    return icons[type] || '📋';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-3 shadow-lg z-50 border-t border-gray-700">
      <div className="flex items-center justify-between max-w-full">
        {/* Window Buttons */}
        <div className="flex items-center space-x-2 flex-1 overflow-x-auto">
          {windows.map((window) => (
            <button
              key={window.id}
              onClick={() => {
                if (window.isMinimized) {
                  restoreWindow(window.id);
                }
                setActiveWindow(window.id);
              }}
              className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md truncate max-w-48 transition-all ${
                activeWindowId === window.id && !window.isMinimized
                  ? 'bg-blue-600 text-white shadow-md'
                  : window.isMinimized
                  ? 'bg-gray-700 text-gray-300 opacity-75'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
              }`}
              title={window.title}
            >
              <span className="text-base">{getWindowTypeIcon(window.type)}</span>
              <span className="truncate">{window.title}</span>
              {!window.isMinimized && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(window.id);
                  }}
                  className="ml-1 p-1 rounded hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </button>
          ))}
        </div>

        {/* Window Management Controls */}
        <div className="flex items-center space-x-2 ml-4">
          <div className="text-xs text-gray-400 px-2">
            {visibleWindows.length} open
            {minimizedWindows.length > 0 && `, ${minimizedWindows.length} minimized`}
          </div>
          
          <div className="h-4 w-px bg-gray-600"></div>
          
          <button
            onClick={cascadeWindows}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            title="Cascade Windows"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
          
          <button
            onClick={tileWindows}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            title="Tile Windows"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>

          <button
            onClick={closeAllWindows}
            className="p-2 hover:bg-red-700 rounded-md transition-colors text-red-400"
            title="Close All Windows"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WindowTaskbar;