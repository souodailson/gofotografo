import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const DraggableDashboardCard = ({ card, index, isPersonalizing, renderCardContent }) => {
  if (!card || !card.id) {
    return null; 
  }
  return (
    <Draggable key={card.id} draggableId={card.id} index={index} isDragDisabled={!isPersonalizing}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1,
            boxShadow: snapshot.isDragging ? '0 0 15px rgba(0,0,0,0.2)' : 'none',
          }}
          className={isPersonalizing ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg my-1" : ""}
        >
          {renderCardContent(card)}
        </div>
      )}
    </Draggable>
  );
};

export default DraggableDashboardCard;