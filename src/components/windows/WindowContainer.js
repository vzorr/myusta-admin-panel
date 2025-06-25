// src/components/windows/WindowContainer.js

import { useWindows, WINDOW_TYPES } from '../../context/WindowContext';
import TableDataWindow from './TableDataWindow';
import TableSchemaWindow from './TableSchemaWindow';
import RecordDetailWindow from './RecordDetailWindow';
import DraggableWindow from './DraggableWindow';

const WindowContainer = () => {
  const { windows } = useWindows();

  const renderWindowContent = (window) => {
    switch (window.type) {
      case WINDOW_TYPES.TABLE_DATA:
        return <TableDataWindow window={window} />;
      case WINDOW_TYPES.TABLE_SCHEMA:
        return <TableSchemaWindow window={window} />;
      case WINDOW_TYPES.RECORD_DETAIL:
        return <RecordDetailWindow window={window} />;
      case WINDOW_TYPES.SEARCH_RESULTS:
        return <SearchResultsWindow window={window} />;
      case WINDOW_TYPES.CREATE_RECORD:
        return <CreateRecordWindow window={window} />;
      default:
        return (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unknown Window Type</h3>
            <p className="text-gray-500">Window type '{window.type}' is not recognized</p>
            <div className="mt-4 text-xs text-gray-400 font-mono bg-gray-100 p-2 rounded">
              Window ID: {window.id}
            </div>
          </div>
        );
    }
  };

  // Don't render anything if no windows are open
  if (windows.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {windows.map((window) => (
        <DraggableWindow key={window.id} window={window}>
          {renderWindowContent(window)}
        </DraggableWindow>
      ))}
    </div>
  );
};

export default WindowContainer;