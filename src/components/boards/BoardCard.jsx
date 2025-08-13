import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import BoardCardModal from '@/components/modals/BoardCardModal';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Square, Star, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

// Função para calcular contraste adequado
const getContrastColor = (backgroundColor) => {
  if (!backgroundColor) return '#000000';
  
  // Remove # se presente
  const hex = backgroundColor.replace('#', '');
  
  // Converte para RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calcula luminância
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retorna cor com contraste adequado
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Função para garantir contraste adequado das etiquetas
const getTagStyle = (tagColor, cardBackgroundColor) => {
  if (!tagColor) return { backgroundColor: '#6b7280', color: '#ffffff' };
  
  // Se não há cor de fundo do card, usa a cor da etiqueta normalmente
  if (!cardBackgroundColor || cardBackgroundColor === '#3b82f6') {
    const textColor = tagColor === '#f59e0b' || tagColor === '#84cc16' ? '#000' : '#fff';
    return { backgroundColor: tagColor, color: textColor };
  }
  
  // Calcula se a cor da etiqueta é muito similar à do card
  const cardHex = cardBackgroundColor.replace('#', '');
  const tagHex = tagColor.replace('#', '');
  
  const cardR = parseInt(cardHex.substr(0, 2), 16);
  const cardG = parseInt(cardHex.substr(2, 2), 16);
  const cardB = parseInt(cardHex.substr(4, 2), 16);
  
  const tagR = parseInt(tagHex.substr(0, 2), 16);
  const tagG = parseInt(tagHex.substr(2, 2), 16);
  const tagB = parseInt(tagHex.substr(4, 2), 16);
  
  // Calcula diferença de cor usando distância euclidiana
  const colorDistance = Math.sqrt(
    Math.pow(cardR - tagR, 2) + 
    Math.pow(cardG - tagG, 2) + 
    Math.pow(cardB - tagB, 2)
  );
  
  // Se as cores são muito similares (diferença < 100), aplica contraste forçado
  if (colorDistance < 100) {
    const cardLuminance = (0.299 * cardR + 0.587 * cardG + 0.114 * cardB) / 255;
    if (cardLuminance > 0.5) {
      // Card claro, etiqueta escura
      return { backgroundColor: '#1f2937', color: '#ffffff', border: '1px solid #374151' };
    } else {
      // Card escuro, etiqueta clara
      return { backgroundColor: '#f9fafb', color: '#111827', border: '1px solid #d1d5db' };
    }
  }
  
  // Cores suficientemente diferentes, usa cor original da etiqueta
  const textColor = tagColor === '#f59e0b' || tagColor === '#84cc16' ? '#000' : '#fff';
  return { backgroundColor: tagColor, color: textColor };
};

const BoardCard = ({ card, index, refreshColumns }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const customizacao = card.customizacao || {};
  const hasCustomColor = customizacao.cor && customizacao.cor !== '#3b82f6';
  const textColor = hasCustomColor ? getContrastColor(customizacao.cor) : null;
  
  // Garantir que tags sejam sempre um array
  const tags = Array.isArray(customizacao.tags) ? customizacao.tags : [];
  const comentarios = Array.isArray(customizacao.comentarios) ? customizacao.comentarios : [];
  
  const priorityConfig = {
    baixa: { color: 'text-green-600', bg: 'bg-green-100' },
    media: { color: 'text-yellow-600', bg: 'bg-yellow-100' },
    alta: { color: 'text-orange-600', bg: 'bg-orange-100' },
    critica: { color: 'text-red-600', bg: 'bg-red-100' }
  };

  const priorityStyle = priorityConfig[customizacao.prioridade] || priorityConfig.media;

  const renderContent = () => {
    if (card.conteudo?.type === 'checklist' && Array.isArray(card.conteudo.items)) {
      const completedCount = card.conteudo.items.filter(item => item.completed).length;
      const totalCount = card.conteudo.items.length;
      return (
        <div>
          <h4 className="font-medium text-sm mb-2" style={{ color: hasCustomColor ? textColor : undefined }}>
            {card.conteudo.title || 'Checklist'}
          </h4>
          <div className="space-y-1">
            {card.conteudo.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center text-xs" style={{ color: hasCustomColor ? textColor : undefined }}>
                {item.completed ? 
                  <CheckSquare className="w-3 h-3 mr-2 text-green-500" style={{ color: hasCustomColor ? textColor : undefined }} /> : 
                  <Square className="w-3 h-3 mr-2" style={{ color: hasCustomColor ? textColor : undefined }} />
                }
                <span className={item.completed ? 'line-through' : ''}>{item.text}</span>
              </div>
            ))}
          </div>
          {totalCount > 3 && <p className="text-xs mt-1" style={{ color: hasCustomColor ? textColor : undefined }}>...e mais {totalCount - 3}</p>}
          {totalCount > 0 && (
            <div className="text-xs text-right mt-2" style={{ color: hasCustomColor ? textColor : undefined }}>
              {completedCount}/{totalCount}
            </div>
          )}
        </div>
      );
    }
    
    return <h4 className="font-medium text-sm break-words" style={{ color: hasCustomColor ? textColor : undefined }}>{card.conteudo?.text || ''}</h4>;
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
              style={{
                ...style,
                ...(hasCustomColor ? {
                  backgroundColor: customizacao.cor,
                  borderColor: customizacao.cor,
                  color: textColor
                } : {})
              }}
              onClick={() => setIsModalOpen(true)}
              className={cn(
                "bg-white/90 dark:bg-background/80 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border",
                snapshot.isDragging && "shadow-lg",
                hasCustomColor && "border-2"
              )}
            >
              {/* Etiquetas e badges */}
              {tags.length > 0 && (
                <div className="mb-2">
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 4).map((tag, index) => (
                      <Badge 
                        key={tag.id || index} 
                        variant="secondary" 
                        className="text-xs px-2 py-1 rounded-full"
                        style={getTagStyle(tag.color, customizacao.cor)}
                      >
                        {tag.text || tag}
                      </Badge>
                    ))}
                    {tags.length > 4 && (
                      <Badge variant="secondary" className="text-xs px-2 py-1 rounded-sm">
                        +{tags.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {/* Indicadores discretos */}
              {(customizacao.dataVencimento || comentarios.length > 0) && (
                <div className="flex items-center gap-2 mb-2">
                  {customizacao.dataVencimento && (
                    <div className="flex items-center text-xs" style={{ color: hasCustomColor ? textColor : undefined }}>
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(customizacao.dataVencimento).toLocaleDateString()}
                    </div>
                  )}
                  {comentarios.length > 0 && (
                    <div className="flex items-center text-xs" style={{ color: hasCustomColor ? textColor : undefined }}>
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {comentarios.length}
                    </div>
                  )}
                </div>
              )}
              
              {renderContent()}

              {/* Observações no rodapé */}
              {customizacao.observacoes && (
                <div className="mt-2 pt-2 border-t" style={{ borderColor: hasCustomColor ? `${textColor}20` : undefined }}>
                  <p className="text-xs line-clamp-2" style={{ color: hasCustomColor ? textColor : undefined }}>
                    {customizacao.observacoes}
                  </p>
                </div>
              )}
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