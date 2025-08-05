import React from 'react';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

const ResizableBlock = ({ children, block, updateBlock, isSelected }) => {
  const { styles = {} } = block;

  const onResizeStop = (e, { size }) => {
    e.stopPropagation();
    updateBlock(block.id, {
      styles: {
        ...styles,
        width: `${size.width}px`,
        height: `${size.height}px`,
      },
    });
  };

  if (!isSelected) {
    return children;
  }

  // This component is now effectively replaced by react-grid-layout's resizing.
  // We will keep the structure but the logic is now handled by the grid.
  // The 'children' will be rendered inside the grid item.
  return (
     <div style={{ width: '100%', height: '100%' }}>
       {children}
     </div>
  );
};

export default ResizableBlock;