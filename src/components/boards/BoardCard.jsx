import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import BoardCardModal from '@/components/modals/BoardCardModal';
import { CheckSquare, Square } from 'lucide-react';

const BoardCard = ({ card, index, refreshColumns }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderContent = () => {
    if (card.conteudo?.type === 'checklist' && Array.isArray(card.conteudo.items)) {
      const completedCount = card.conteudo.items.filter(item => item.completed).length;
      const totalCount = card.conteudo.items.length;
      return (
        <div>
          <h4 className="font-medium text-sm text-foreground mb-2">{card.conteudo.title || 'Checklist'}</h4>
          <div className="space-y-1">
            {card.conteudo.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center text-xs text-muted-foreground">
                {item.completed ? <CheckSquare className="w-3 h-3 mr-2 text-green-500" /> : <Square className="w-3 h-3 mr-2" />}
                <span className={item.completed ? 'line-through' : ''}>{item.text}</span>
              </div>
            ))}
          </div>
          {totalCount > 3 && <p className="text-xs text-muted-foreground mt-1">...e mais {totalCount - 3}</p>}
          {totalCount > 0 && (
            <div className="text-xs text-right mt-2 text-muted-foreground">
              {completedCount}/{totalCount}
            </div>
          )}
        </div>
      );
    }
    
    return <h4 className="font-medium text-sm text-foreground break-words">{card.conteudo?.text || ''}</h4>;
  };

  return (
    <>
      <Draggable draggableId={card.id.toString()} index={index}>
        {(provided, snapshot) => {
          const style = {
            ...provided.draggableProps.style,
            transition: snapshot.isDragging ? 'none' : provided.draggableProps.style?.transition,
          };

          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={style}
              onClick={() => setIsModalOpen(true)}
              className={`bg-white/90 dark:bg-background/80 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer
                ${snapshot.isDragging ? 'shadow-lg' : ''}`}
            >
              {renderContent()}
            </div>
          );
        }}
      </Draggable>
      {isModalOpen && (
        <BoardCardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cardId={card.id}
          refreshBoard={refreshColumns}
        />
      )}
    </>
  );
};

export default BoardCard;