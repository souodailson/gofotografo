import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BoardColumn from './BoardColumn';

const BoardKanbanView = ({ board, showArchived = false }) => {
  const { user } = useData();
  const { toast } = useToast();

  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const fetchBoardData = useCallback(async () => {
    if (!user || !board?.id) return;
    setLoading(true);
    try {
      const { data: columnsData, error: columnsError } = await supabase
        .from('quadro_colunas')
        .select('*, quadro_cards(*)')
        .eq('quadro_id', board.id)
        .order('ordem', { ascending: true });

      if (columnsError) throw columnsError;

      const sortedColumns = columnsData.map(col => {
        let cards = col.quadro_cards || [];
        
        if (showArchived) {
          // Mostrar apenas cards arquivados
          cards = cards.filter(card => card.arquivado === true);
        } else {
          // Mostrar apenas cards não arquivados (incluindo cards sem o campo arquivado)
          cards = cards.filter(card => !card.arquivado);
        }
        
        return {
          ...col,
          cards: cards.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)),
        };
      });

      setColumns(sortedColumns);
      
      // Debug para verificar cards arquivados
      if (showArchived) {
        const totalArchived = columnsData.reduce((total, col) => 
          total + (col.quadro_cards || []).filter(card => card.arquivado === true).length, 0);
        console.log(`Mostrando ${totalArchived} cards arquivados`);
      }
    } catch (error) {
      toast({ title: 'Erro ao carregar colunas', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [board?.id, user, toast, showArchived]);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    try {
      const { data: newColumn, error } = await supabase
        .from('quadro_colunas')
        .insert({
          quadro_id: board.id,
          user_id: user.id,
          titulo_coluna: newColumnName,
          ordem: columns.length,
        })
        .select('*, quadro_cards(*)')
        .single();
      if (error) throw error;

      setColumns([...columns, { ...newColumn, cards: [] }]);
      setNewColumnName('');
      setIsAddingColumn(false);
      toast({ title: 'Coluna adicionada!' });
    } catch (error) {
      toast({ title: 'Erro ao adicionar coluna', description: error.message, variant: 'destructive' });
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;
    
    // Se não há destino ou a posição não mudou, sair
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    
    if (type === 'COLUMN') {
      const newColumnOrder = Array.from(columns);
      const [reorderedItem] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, reorderedItem);
  
      setColumns(newColumnOrder);
  
      const updates = newColumnOrder.map((col, index) =>
        supabase.from('quadro_colunas').update({ ordem: index }).eq('id', col.id)
      );
      try {
        await Promise.all(updates);
      } catch (error) {
        toast({ title: 'Erro ao reordenar colunas', variant: 'destructive' });
        fetchBoardData();
      }
      return;
    }

    if (type === 'CARD') {
      const sourceColumn = columns.find(col => col.id.toString() === source.droppableId);
      const destColumn = columns.find(col => col.id.toString() === destination.droppableId);

      if (!sourceColumn || !destColumn) return;

      // Criar cópias dos arrays de cards
      const sourceCards = [...sourceColumn.cards];
      const destCards = sourceColumn.id === destColumn.id ? sourceCards : [...destColumn.cards];
      
      // Encontrar o card que está sendo movido
      const [movedCard] = sourceCards.splice(source.index, 1);
      
      // Inserir o card na nova posição
      destCards.splice(destination.index, 0, movedCard);

      // Atualizar o estado imediatamente (optimistic update)
      const newColumns = columns.map(col => {
        if (col.id === sourceColumn.id && col.id === destColumn.id) {
          // Mesma coluna
          return { ...col, cards: destCards };
        } else if (col.id === sourceColumn.id) {
          // Coluna de origem
          return { ...col, cards: sourceCards };
        } else if (col.id === destColumn.id) {
          // Coluna de destino
          return { ...col, cards: destCards };
        }
        return col;
      });

      setColumns(newColumns);

      // Atualizar banco de dados em background
      try {
        if (sourceColumn.id === destColumn.id) {
          // Mesma coluna - reorganizar ordens
          const updates = destCards.map((card, index) =>
            supabase
              .from('quadro_cards')
              .update({ ordem: index })
              .eq('id', card.id)
          );
          await Promise.all(updates);
        } else {
          // Colunas diferentes
          // 1. Mover o card para nova coluna
          await supabase
            .from('quadro_cards')
            .update({ 
              coluna_id: destColumn.id,
              ordem: destination.index
            })
            .eq('id', draggableId);

          // 2. Reorganizar coluna de origem
          const sourceUpdates = sourceCards.map((card, index) =>
            supabase
              .from('quadro_cards')
              .update({ ordem: index })
              .eq('id', card.id)
          );

          // 3. Reorganizar coluna de destino
          const destUpdates = destCards.map((card, index) =>
            supabase
              .from('quadro_cards')
              .update({ ordem: index })
              .eq('id', card.id)
          );

          await Promise.all([...sourceUpdates, ...destUpdates]);
        }

        console.log('✅ Card movido e salvo com sucesso');

      } catch (error) {
        console.error('❌ Erro ao salvar posição do cartão:', error);
        // Em caso de erro, reverter para o estado original
        fetchBoardData();
        toast({ 
          title: 'Erro ao mover cartão', 
          description: 'Posição restaurada', 
          variant: 'destructive' 
        });
      }
    }
  };
  
  const refreshColumns = useCallback(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-hide">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex items-start space-x-4 p-4 h-full"
            >
              {columns.map((col, index) => (
                <BoardColumn key={col.id} column={col} index={index} refreshColumns={refreshColumns} boardId={board.id} />
              ))}
              {provided.placeholder}
              <div className="w-72 flex-shrink-0">
                {isAddingColumn ? (
                  <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg">
                    <Input
                      placeholder="Nome da coluna..."
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
                      autoFocus
                      onBlur={() => setIsAddingColumn(false)}
                      className="mb-2"
                    />
                    <Button onClick={handleAddColumn} size="sm">Adicionar</Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsAddingColumn(true)}
                    className="w-full bg-white/20 dark:bg-black/30 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-black/40 text-white"
                    variant="ghost"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar outra coluna
                  </Button>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default BoardKanbanView;