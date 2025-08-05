import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import BlockRenderer from './BlockRenderer';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ResizableBlock from './ResizableBlock';

const DraggableBlock = ({ id, index, block, pageId, moveBlock, setSelectedBlock, isSelected, updateBlock }) => {
  const ref = useRef(null);

  const [{ handlerId }, drop] = useDrop({
    accept: [ItemTypes.BLOCK, ItemTypes.IMAGE_UPLOAD],
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) return;
      if (item.pageId !== pageId) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveBlock(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.BLOCK,
    item: () => ({ id, index, pageId }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  preview(drop(ref));

  const handleDelete = (e) => {
    e.stopPropagation();
    updateBlock(id, null); // Signal deletion
  };

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.3 : 1 }}
      data-handler-id={handlerId}
      className={cn(
        "relative group cursor-pointer transition-all duration-200 p-1",
        isSelected && "ring-2 ring-blue-500 ring-offset-2"
      )}
      onClick={(e) => { e.stopPropagation(); setSelectedBlock(block) }}
    >
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div ref={drag} className="cursor-move p-1 text-muted-foreground hover:text-foreground">
          <GripVertical size={18} />
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={handleDelete}>
          <Trash2 size={14} />
        </Button>
      </div>
      <ResizableBlock block={block} updateBlock={updateBlock} isSelected={isSelected}>
        <BlockRenderer block={block} isSelected={isSelected} updateBlock={updateBlock} />
      </ResizableBlock>
    </div>
  );
};

export default DraggableBlock;