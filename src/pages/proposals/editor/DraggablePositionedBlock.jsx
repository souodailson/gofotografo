import React, { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { useDrop, useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import BlockRenderer from './BlockRenderer';
import { Lock, Trash2, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getResponsiveBlockProps } from '@/lib/utils';
import { cn } from '@/lib/utils';

const SNAP_THRESHOLD = 8;

const DraggablePositionedBlock = ({ block, updateBlock, setSelectedBlock, isSelected, onContextMenu, sectionRef, otherBlocks, setSnapLines, viewMode, sectionId, onPdfHeightChange }) => {
  const { id, locked, type } = block;
  const responsiveProps = getResponsiveBlockProps(block, viewMode);
  const { position, size, styles } = responsiveProps;

  const [isResizing, setIsResizing] = useState(false);
  const nodeRef = useRef(null);
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
  });

  const [{ isDndDragging }, dndDrag] = useDrag(() => ({
    type: ItemTypes.POSITIONED_BLOCK,
    item: { id, sectionId },
    collect: (monitor) => ({
      isDndDragging: monitor.isDragging(),
    }),
  }));

  const getPositionInPixels = () => {
    if (!sectionRef.current) return { x: 0, y: 0 };
    const sectionRect = sectionRef.current.getBoundingClientRect();
    const x = (parseFloat(position?.x) / 100) * sectionRect.width;
    const y = (parseFloat(position?.y) / 100) * sectionRect.height;
    return { x, y };
  };

  const getSizeInPixels = () => {
    if (!sectionRef.current) return { width: 300, height: 200 };
    const sectionRect = sectionRef.current.getBoundingClientRect();
    const width = size?.width === 'auto' ? 'auto' : (parseFloat(size?.width) / 100) * sectionRect.width;
    const height = size?.height === 'auto' ? 'auto' : (parseFloat(size?.height) / 100) * sectionRect.height;
    return { width, height };
  };

  const handleDragStart = (e, data) => {
    dragRef.current = {
      isDragging: false,
      startX: data.x,
      startY: data.y,
    };
  };

  const handleDrag = (e, data) => {
    if (!dragRef.current.isDragging) {
      const dx = Math.abs(data.x - dragRef.current.startX);
      const dy = Math.abs(data.y - dragRef.current.startY);
      if (dx > 5 || dy > 5) {
        dragRef.current.isDragging = true;
      }
    }

    if (!dragRef.current.isDragging) return;

    if (!sectionRef.current) return;
    const sectionRect = sectionRef.current.getBoundingClientRect();
    const blockRect = nodeRef.current.getBoundingClientRect();

    let newLeft = data.x;
    let newTop = data.y;
    const newRight = newLeft + blockRect.width;
    const newBottom = newTop + blockRect.height;
    const newCenterX = newLeft + blockRect.width / 2;
    const newCenterY = newTop + blockRect.height / 2;

    const lines = [];
    const sectionCenterX = sectionRect.width / 2;
    if (Math.abs(newCenterX - sectionCenterX) < SNAP_THRESHOLD) {
      newLeft = sectionCenterX - blockRect.width / 2;
      lines.push({ type: 'vertical', position: sectionCenterX });
    }

    otherBlocks.forEach(other => {
      if (other.id === id) return;
      const otherEl = document.querySelector(`[data-block-id="${other.id}"]`);
      if (!otherEl) return;
      
      const otherResponsiveProps = getResponsiveBlockProps(other, viewMode);
      if (otherResponsiveProps.visible === false) return;

      const otherRect = otherEl.getBoundingClientRect();
      const otherLeft = otherRect.left - sectionRect.left;
      const otherTop = otherRect.top - sectionRect.top;
      const otherRight = otherLeft + otherRect.width;
      const otherBottom = otherTop + otherRect.height;
      const otherCenterX = otherLeft + otherRect.width / 2;
      const otherCenterY = otherTop + otherRect.height / 2;

      if (Math.abs(newLeft - otherLeft) < SNAP_THRESHOLD) { newLeft = otherLeft; lines.push({ type: 'vertical', position: otherLeft }); }
      if (Math.abs(newRight - otherRight) < SNAP_THRESHOLD) { newLeft = otherRight - blockRect.width; lines.push({ type: 'vertical', position: otherRight }); }
      if (Math.abs(newCenterX - otherCenterX) < SNAP_THRESHOLD) { newLeft = otherCenterX - blockRect.width / 2; lines.push({ type: 'vertical', position: otherCenterX }); }
      if (Math.abs(newLeft - otherRight) < SNAP_THRESHOLD) { newLeft = otherRight; lines.push({ type: 'vertical', position: otherRight }); }
      if (Math.abs(newRight - otherLeft) < SNAP_THRESHOLD) { newLeft = otherLeft - blockRect.width; lines.push({ type: 'vertical', position: otherLeft }); }

      if (Math.abs(newTop - otherTop) < SNAP_THRESHOLD) { newTop = otherTop; lines.push({ type: 'horizontal', position: otherTop }); }
      if (Math.abs(newBottom - otherBottom) < SNAP_THRESHOLD) { newTop = otherBottom - blockRect.height; lines.push({ type: 'horizontal', position: otherBottom }); }
      if (Math.abs(newCenterY - otherCenterY) < SNAP_THRESHOLD) { newTop = otherCenterY - blockRect.height / 2; lines.push({ type: 'horizontal', position: otherCenterY }); }
      if (Math.abs(newTop - otherBottom) < SNAP_THRESHOLD) { newTop = otherBottom; lines.push({ type: 'horizontal', position: otherBottom }); }
      if (Math.abs(newBottom - otherTop) < SNAP_THRESHOLD) { newTop = otherTop - blockRect.height; lines.push({ type: 'horizontal', position: otherTop }); }
    });

    setSnapLines(lines);
  };

  const handleStop = (e, data) => {
    if (!dragRef.current.isDragging) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedBlock(block);
    } else {
      if (!sectionRef.current) return;
      const sectionRect = sectionRef.current.getBoundingClientRect();
      const newXPercent = (data.x / sectionRect.width) * 100;
      const newYPercent = (data.y / sectionRect.height) * 100;
      const newPosition = { x: `${newXPercent}%`, y: `${newYPercent}%` };

      updateBlock(id, { position: newPosition }, viewMode);
    }
    setSnapLines([]);
    dragRef.current.isDragging = false;
  };

  const onResizeStop = (e, { size: newSize }) => {
    e.stopPropagation();
    if (locked || !sectionRef.current) return;
    setIsResizing(false);
    const sectionRect = sectionRef.current.getBoundingClientRect();
    const newWidthPercent = (newSize.width / sectionRect.width) * 100;
    const newHeightPercent = (newSize.height / sectionRect.height) * 100;
    
    const newSizeProp = { 
      width: `${newWidthPercent}%`, 
      height: size.height === 'auto' ? 'auto' : `${newHeightPercent}%`,
    };

    updateBlock(id, { size: newSizeProp }, viewMode);
  };

  const onResizeStart = (e) => { 
      e.stopPropagation(); 
      if (!locked) {
        setIsResizing(true); 
      }
  };

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.IMAGE_UPLOAD,
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      if (block.type === 'image') {
        updateBlock(id, { content: { ...block.content, src: item.url } }, viewMode);
        return { droppedOnBlock: true };
      }
    },
  }), [id, block.type, updateBlock, viewMode]);
  
  const toggleVisibility = (e) => {
    e.stopPropagation();
    const currentVisibility = responsiveProps.visible;
    const newVisibility = currentVisibility === undefined ? false : !currentVisibility;
    
    updateBlock(id, { visible: newVisibility }, viewMode);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    updateBlock(id, null);
  };

  const handleBlockContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBlock(block);
    onContextMenu(e, block);
  };

  const pixelPosition = getPositionInPixels();
  const pixelSize = getSizeInPixels();

  dndDrag(nodeRef);
  
  const isHeightAuto = size?.height === 'auto';

  if (type === 'pdf') {
    return (
      <div 
        onContextMenu={handleBlockContextMenu} 
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        <BlockRenderer block={block} viewMode={viewMode} onPdfHeightChange={onPdfHeightChange} isSelected={isSelected}/>
      </div>
    );
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      position={pixelPosition}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleStop}
      disabled={isResizing || locked || isDndDragging}
      bounds="parent"
    >
      <div
        ref={nodeRef}
        style={{
          position: 'absolute',
          zIndex: styles?.zIndex || 10,
          cursor: isResizing ? 'auto' : (locked ? 'default' : 'move'),
          width: size?.width,
          height: size?.height,
          visibility: responsiveProps.visible === false ? 'hidden' : 'visible',
          opacity: isDndDragging ? 0.5 : 1,
        }}
        onContextMenu={handleBlockContextMenu}
        data-block-id={id}
      >
        <ResizableBox
          width={pixelSize.width === 'auto' ? Infinity : pixelSize.width}
          height={isHeightAuto ? Infinity : pixelSize.height}
          onResizeStart={onResizeStart}
          onResizeStop={onResizeStop}
          draggableOpts={{ enableUserSelectHack: false, disabled: true }}
          className={cn("box", isHeightAuto && "inline-block", isResizing && "resizing-active")}
          handle={isSelected && !locked ? undefined : <></>}
          axis={isHeightAuto ? 'x' : 'both'}
          minConstraints={block.type === 'text' ? [100, 20] : [50, 50]}
        >
          <div ref={drop} className="relative w-full h-full" style={{
            outline: isSelected ? '2px solid #3B82F6' : 'none',
            outlineOffset: '2px',
            transition: 'outline 0.2s ease-in-out',
          }}>
            <BlockRenderer block={block} isSelected={isSelected} updateBlock={updateBlock} viewMode={viewMode} onPdfHeightChange={onPdfHeightChange} />
            {isSelected && (
              <>
                {locked && (
                  <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground p-1 rounded-full z-50">
                    <Lock size={12} />
                  </div>
                )}
                 <div className="absolute top-0 right-0 -translate-y-full flex gap-1 z-50 bg-background p-1 rounded-t-md">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleVisibility}>
                        {responsiveProps.visible !== false ? <Maximize size={12}/> : <Minimize size={12}/>}
                    </Button>
                    <Button variant="destructive" size="icon" className="h-6 w-6" onClick={handleDelete}>
                        <Trash2 size={12} />
                    </Button>
                </div>
              </>
            )}
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
};

export default DraggablePositionedBlock;