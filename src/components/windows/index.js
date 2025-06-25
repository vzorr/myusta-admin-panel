// src/components/windows/index.js
import WindowContainer from './WindowContainer';
import DraggableWindow from './DraggableWindow';
import WindowTaskbar from './WindowTaskbar';
import TableDataWindow from './TableDataWindow';
import TableSchemaWindow from './TableSchemaWindow';
import RecordDetailWindow from './RecordDetailWindow';

// Export individual components
export {
  WindowContainer,
  DraggableWindow,
  WindowTaskbar,
  TableDataWindow,
  TableSchemaWindow,
  RecordDetailWindow
};

// Export default as WindowContainer for convenience
export default WindowContainer;