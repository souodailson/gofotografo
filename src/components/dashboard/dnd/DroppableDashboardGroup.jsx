import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import DraggableDashboardCard from './DraggableDashboardCard';

const DroppableDashboardGroup = ({ groupId, className, cards, isPersonalizing, isMobile, renderCardContent }) => {
  return (
    <Droppable key={groupId} droppableId={groupId} direction={isMobile ? "vertical" : "horizontal"} isDropDisabled={!isPersonalizing}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`${className} ${isPersonalizing && snapshot.isDraggingOver ? 'bg-primary/10 p-2 rounded-lg border-2 border-dashed border-primary' : ''} ${isPersonalizing && !snapshot.isDraggingOver ? 'p-2 border-2 border-dashed border-border rounded-lg' : ''}`}
        >
          {cards.map((card, index) => (
            card && <DraggableDashboardCard key={card.id} card={card} index={index} isPersonalizing={isPersonalizing} renderCardContent={renderCardContent} />
          ))}
          {provided.placeholder}
          {isPersonalizing && cards.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              Arraste cards para este grupo
            </div>
          )}
        </div>
      )}
    </Droppable>
  );
};

export default DroppableDashboardGroup;