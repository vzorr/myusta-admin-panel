// src/components/windows/DraggableWindow.js
import React from 'react';
import { useWindows, WINDOW_TYPES } from '../../context/WindowContext';

const DraggableWindow = ({ window, children }) => {
  const {
    closeWindow,
    setActiveWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    moveWindow,
    resizeWindow,
    activeWindowId
  } = useWindows();

  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = React.useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isAnimating, setIsAnimating] = React.useState(false);
  const windowRef = React.useRef(null);
  const dragHandleRef = React.useRef(null);

  const isActive = activeWindowId === window.id;

  // Handle window activation
  const handleActivate = React.useCallback(() => {
    if (activeWindowId !== window.id) {
      setActiveWindow(window.id);
    }
  }, [activeWindowId, window.id, setActiveWindow]);

  // Handle drag start
  const handleMouseDown = React.useCallback((e) => {
    if (e.target.closest('.window-controls') || e.target.closest('.no-drag')) return;
    
    e.preventDefault();
    handleActivate();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y
    });
  }, [window.position, handleActivate]);

  // Handle resize start
  const handleResizeMouseDown = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.size.width,
      height: window.size.height
    });
  }, [window.size]);

  // Handle double-click to maximize/restore
  const handleDoubleClick = React.useCallback((e) => {
    if (e.target.closest('.window-controls')) return;
    maximizeWindow(window.id);
  }, [window.id, maximizeWindow]);

  // Mouse move and up handlers
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && !window.isMaximized) {
        const parentWidth = window.parentWidth || window.innerWidth || 1200;
        const parentHeight = window.parentHeight || window.innerHeight || 800;
        
        const newX = Math.max(0, Math.min(e.clientX - dragStart.x, parentWidth - window.size.width));
        const newY = Math.max(0, Math.min(e.clientY - dragStart.y, parentHeight - window.size.height));
        moveWindow(window.id, { x: newX, y: newY });
      }

      if (isResizing && !window.isMaximized) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const parentWidth = window.parentWidth || window.innerWidth || 1200;
        const parentHeight = window.parentHeight || window.innerHeight || 800;
        
        const newWidth = Math.max(400, Math.min(resizeStart.width + deltaX, parentWidth));
        const newHeight = Math.max(300, Math.min(resizeStart.height + deltaY, parentHeight));
        resizeWindow(window.id, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isDragging ? 'move' : 'se-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, isResizing, dragStart, resizeStart, window]);

  // Animation for minimize/maximize
  const handleMinimize = React.useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      minimizeWindow(window.id);
      setIsAnimating(false);
    }, 200);
  }, [window.id, minimizeWindow]);

  const handleMaximize = React.useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      maximizeWindow(window.id);
      setIsAnimating(false);
    }, 200);
  }, [window.id, maximizeWindow]);

  if (window.isMinimized) {
    return null;
  }

  const windowStyle = {
    position: 'absolute',
    left: window.position.x,
    top: window.position.y,
    width: window.size.width,
    height: window.size.height,
    zIndex: window.zIndex,
    pointerEvents: 'auto',
    transition: isAnimating ? 'all 0.2s ease-in-out' : 'none'
  };

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
    <div
      ref={windowRef}
      style={windowStyle}
      className={`bg-white border rounded-lg shadow-lg overflow-hidden transform transition-transform duration-200 ${
        isActive ? 'ring-2 ring-blue-500 shadow-xl scale-100' : 'shadow-lg scale-95'
      } ${isDragging ? 'cursor-move' : ''} ${isResizing ? 'cursor-se-resize' : ''}`}
      onMouseDown={handleActivate}
    >
      {/* Window Header */}
      <div
        ref={dragHandleRef}
        className={`flex items-center justify-between px-4 py-3 border-b cursor-move select-none ${
          isActive 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
            : 'bg-gray-50 text-gray-900'
        }`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <span className="text-lg">{getWindowTypeIcon(window.type)}</span>
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate text-sm">
              {window.title}
            </div>
            {window.table && (
              <div className={`text-xs truncate ${
                isActive ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {window.table.tableName} • {window.table.backend}
              </div>
            )}
          </div>
        </div>

        {/* Window Controls */}
        <div className="window-controls flex items-center space-x-1 ml-4">
          <button
            onClick={handleMinimize}
            className={`p-2 rounded-md transition-colors ${
              isActive 
                ? 'hover:bg-blue-400 hover:bg-opacity-50' 
                : 'hover:bg-gray-200'
            }`}
            title="Minimize"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
            </svg>
          </button>
          
          <button
            onClick={handleMaximize}
            className={`p-2 rounded-md transition-colors ${
              isActive 
                ? 'hover:bg-blue-400 hover:bg-opacity-50' 
                : 'hover:bg-gray-200'
            }`}
            title={window.isMaximized ? "Restore" : "Maximize"}
          >
            {window.isMaximized ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          <button
            onClick={() => closeWindow(window.id)}
            className={`p-2 rounded-md transition-colors ${
              isActive 
                ? 'hover:bg-red-500 hover:bg-opacity-50' 
                : 'hover:bg-red-200'
            }`}
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 60px)' }}>
        {children}
      </div>

      {/* Resize Handle */}
      {!window.isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeMouseDown}
        >
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default DraggableWindow;