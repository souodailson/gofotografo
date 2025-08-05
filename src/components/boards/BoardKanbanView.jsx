import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BoardColumn from './BoardColumn';

const BoardKanbanView = ({ board }) => {
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

      const sortedColumns = columnsData.map(col => ({
        ...col,
        cards: (col.quadro_cards || []).sort((a, b) => a.ordem - b.ordem),
      }));

      setColumns(sortedColumns);
    } catch (error) {
      toast({ title: 'Erro ao carregar colunas', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [board?.id, user, toast]);

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
    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
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
        const startColumn = columns.find(col => col.id.toString() === source.droppableId);
        const endColumn = columns.find(col => col.id.toString() === destination.droppableId);

        if (!startColumn || !endColumn) return;

        const startCards = Array.from(startColumn.cards);
        const [movedCard] = startCards.splice(source.index, 1);

        // Optimistic UI Update
        if (startColumn.id === endColumn.id) {
            // Moving within the same column
            startCards.splice(destination.index, 0, movedCard);
            const newColumns = columns.map(c => c.id === startColumn.id ? { ...c, cards: startCards } : c);
            setColumns(newColumns);
        } else {
            // Moving to a different column
            const endCards = Array.from(endColumn.cards);
            endCards.splice(destination.index, 0, movedCard);
            const newColumns = columns.map(c => {
                if (c.id === startColumn.id) return { ...c, cards: startCards };
                if (c.id === endColumn.id) return { ...c, cards: endCards };
                return c;
            });
            setColumns(newColumns);
        }

        // Database Update
        try {
            await supabase.rpc('move_card', {
                card_id_to_move: draggableId,
                new_coluna_id: endColumn.id,
                new_ordem: destination.index
            });
        } catch (error) {
            toast({ title: 'Erro ao mover o cartão', description: 'Ocorreu um erro ao salvar a nova posição. O quadro será atualizado.', variant: 'destructive' });
            fetchBoardData(); // Revert optimistic update on error
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
    <div className="flex-grow overflow-x-auto overflow-y-hidden h-full">
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