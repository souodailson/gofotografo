import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical } from 'lucide-react';

const ItemTypes = {
  SECTION: 'section',
};

const DraggableSection = ({ id, index, moveSection, children, isCover }) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: ItemTypes.SECTION,
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      if (isCover || item.isCover) return; // Prevent dropping on or dragging the cover
      moveSection(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.SECTION,
    item: () => ({ id, index, isCover }),
    canDrag: !isCover,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  preview(drop(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }} className="relative">
      {!isCover && (
        <div ref={drag} className="absolute left-0 top-1/2 -translate-y-1/2 cursor-move p-2 z-10">
          <GripVertical className="text-muted-foreground hover:text-foreground" />
        </div>
      )}
      {children}
    </div>
  );
};

export default DraggableSection;