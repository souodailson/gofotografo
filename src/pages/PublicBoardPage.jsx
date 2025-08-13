import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Eye, Trello } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Square, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

// Componente de Card público (somente leitura)
const PublicBoardCard = ({ card, index }) => {
  const customizacao = card.customizacao || {};
  const hasCustomColor = customizacao.cor && customizacao.cor !== '#3b82f6';
  
  const getContrastColor = (backgroundColor) => {
    if (!backgroundColor) return '#000000';
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };
  
  const textColor = hasCustomColor ? getContrastColor(customizacao.cor) : null;
  const tags = Array.isArray(customizacao.tags) ? customizacao.tags : [];
  const comentarios = Array.isArray(customizacao.comentarios) ? customizacao.comentarios : [];

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
    <Draggable draggableId={card.id.toString()} index={index} isDragDisabled={true}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            ...(hasCustomColor ? {
              backgroundColor: customizacao.cor,
              borderColor: customizacao.cor,
              color: textColor
            } : {})
          }}
          className={cn(
            "bg-white/90 dark:bg-background/80 p-3 rounded-lg shadow-sm border cursor-default",
            hasCustomColor && "border-2"
          )}
        >
          {/* Etiquetas */}
          {tags.length > 0 && (
            <div className="mb-2">
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 4).map((tag, index) => (
                  <Badge 
                    key={tag.id || index} 
                    variant="secondary" 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: tag.color || '#6b7280', 
                      color: tag.color ? (tag.color === '#f59e0b' || tag.color === '#84cc16' ? '#000' : '#fff') : '#fff',
                      border: 'none'
                    }}
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
          
          {/* Indicadores */}
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

          {/* Observações */}
          {customizacao.observacoes && (
            <div className="mt-2 pt-2 border-t" style={{ borderColor: hasCustomColor ? `${textColor}20` : undefined }}>
              <p className="text-xs line-clamp-2" style={{ color: hasCustomColor ? textColor : undefined }}>
                {customizacao.observacoes}
              </p>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

// Componente de Coluna público (somente leitura)
const PublicBoardColumn = ({ column, index }) => {
  return (
    <Draggable draggableId={String(column.id)} index={index} isDragDisabled={true}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="w-72 flex-shrink-0"
        >
          <div className="relative rounded-lg flex flex-col max-h-full">
            <div className="absolute inset-0 bg-black/40 dark:bg-black/50 backdrop-blur-md rounded-lg -z-10"></div>
            
            <div {...provided.dragHandleProps} className="p-2 flex items-center justify-between text-white dark:text-gray-200">
              <h3 className="font-semibold px-2 py-1">{column.titulo_coluna}</h3>
            </div>
            
            <Droppable droppableId={String(column.id)} type="CARD" isDropDisabled={true}>
              {(providedDrop) => (
                <div
                  ref={providedDrop.innerRef}
                  {...providedDrop.droppableProps}
                  className="px-2 py-1 overflow-y-auto flex-grow min-h-[50px] flex flex-col gap-2 scrollbar-hide"
                >
                  {column.cards && column.cards.length > 0 && column.cards.map((card, cardIndex) => (
                    card ? <PublicBoardCard key={card.id} card={card} index={cardIndex} /> : null
                  ))}
                  {providedDrop.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      )}
    </Draggable>
  );
};

const PublicBoardPage = () => {
  const { shareId } = useParams();
  const { toast } = useToast();
  
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageStyle, setPageStyle] = useState({});

  const fetchPublicBoardData = useCallback(async () => {
    if (!shareId) return;
    
    setLoading(true);
    try {
      console.log('🔍 Buscando quadro público com shareId:', shareId);
      
      // Buscar quadro compartilhado
      const { data: boardData, error: boardError } = await supabase
        .from('quadros')
        .select('*')
        .eq('share_id', shareId)
        .eq('is_public', true)
        .single();

      if (boardError) {
        console.error('❌ Erro ao buscar quadro:', boardError);
        if (boardError.code === 'PGRST116') {
          throw new Error('Quadro não encontrado ou não está público');
        }
        throw boardError;
      }
      
      console.log('✅ Quadro encontrado:', boardData);

      setBoard(boardData);

      // Definir fundo da página
      if (boardData.imagem_fundo) {
        setPageStyle({
          backgroundImage: `url(${boardData.imagem_fundo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        });
      }

      // Buscar colunas e cards
      console.log('🔍 Buscando colunas para quadro ID:', boardData.id);
      
      const { data: columnsData, error: columnsError } = await supabase
        .from('quadro_colunas')
        .select('*, quadro_cards(*)')
        .eq('quadro_id', boardData.id)
        .order('ordem', { ascending: true });

      if (columnsError) {
        console.error('❌ Erro ao buscar colunas:', columnsError);
        throw columnsError;
      }
      
      console.log('✅ Colunas encontradas:', columnsData);

      const sortedColumns = columnsData.map(col => ({
        ...col,
        cards: (col.quadro_cards || [])
          .filter(card => card.arquivado !== true) // Só mostrar cards não arquivados
          .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
      }));

      console.log('✅ Colunas processadas:', sortedColumns);
      setColumns(sortedColumns);
    } catch (error) {
      console.error('Erro ao carregar quadro público:', error);
      toast({ 
        title: 'Erro ao carregar quadro', 
        description: error.message || 'Quadro não encontrado ou não está disponível publicamente',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  }, [shareId, toast]);

  useEffect(() => {
    fetchPublicBoardData();
  }, [fetchPublicBoardData]);

  // Aplicar estilo de fundo ao body
  useEffect(() => {
    const originalStyle = document.body.style.cssText;
    
    if (pageStyle.backgroundImage) {
      Object.assign(document.body.style, pageStyle);
    }

    return () => {
      document.body.style.cssText = originalStyle;
    };
  }, [pageStyle]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Carregando quadro...</h2>
          <p className="text-muted-foreground">Aguarde enquanto buscamos o quadro compartilhado</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4 bg-background">
        <Trello className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Quadro não encontrado</h2>
        <p className="text-muted-foreground">
          O quadro que você está procurando não existe ou não está disponível publicamente.
        </p>
      </div>
    );
  }

  const onDragEnd = () => {
    // Drag and drop desabilitado para visualização pública
    return;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header fixo */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">{board.nome_quadro}</h1>
              <p className="text-sm text-white/70">Visualização pública</p>
            </div>
          </div>
          <div className="text-sm text-white/60">
            Somente leitura
          </div>
        </div>
      </header>

      {/* Conteúdo do quadro */}
      <div className="flex-grow overflow-hidden">
        <div className="h-full overflow-x-auto overflow-y-hidden scrollbar-hide">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="board" type="COLUMN" direction="horizontal" isDropDisabled={true}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex items-start space-x-4 p-4 h-full min-w-max"
                >
                  {columns.map((col, index) => (
                    <PublicBoardColumn key={col.id} column={col} index={index} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default PublicBoardPage;