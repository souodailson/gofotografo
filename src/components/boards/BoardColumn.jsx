import React, { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import BoardCard from './BoardCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';

const BoardColumn = ({ column, index, refreshColumns, boardId }) => {
  const { user } = useData();
  const { toast } = useToast();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.titulo_coluna);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardContent, setNewCardContent] = useState('');

  const handleUpdateTitle = async () => {
    if (!columnTitle.trim() || columnTitle.trim() === column.titulo_coluna) {
      setIsEditingTitle(false);
      setColumnTitle(column.titulo_coluna);
      return;
    }
    try {
      const { error } = await supabase.from('quadro_colunas').update({ titulo_coluna: columnTitle.trim() }).eq('id', column.id);
      if (error) throw error;
      toast({ title: 'Coluna atualizada!' });
      setIsEditingTitle(false);
      refreshColumns();
    } catch (error) {
      toast({ title: 'Erro ao atualizar coluna', description: error.message, variant: 'destructive' });
      setColumnTitle(column.titulo_coluna);
    }
  };
  
  const handleAddCard = async () => {
    if(!newCardContent.trim() || !user) return;
    try {
        await supabase.from('quadro_cards').insert({
            conteudo: { text: newCardContent },
            coluna_id: column.id,
            user_id: user.id,
            ordem: column.cards?.length || 0,
        }).select().single();

        setNewCardContent('');
        setIsAddingCard(false);
        refreshColumns();
        toast({title: 'Cartão adicionado!'});

    } catch(error) {
        toast({ title: 'Erro ao adicionar cartão', description: error.message, variant: 'destructive' });
    }
  };
  
  const handleDeleteColumn = async () => {
    if (column.cards && column.cards.length > 0) {
        toast({ title: 'Coluna não está vazia', description: "Mova ou exclua todos os cartões antes de remover a coluna.", variant: 'destructive' });
        return;
    }

    try {
      const { error } = await supabase.from('quadro_colunas').delete().eq('id', column.id);
      if (error) throw error;
      
      toast({ title: 'Coluna excluída!' });
      refreshColumns();
    } catch (error) {
       toast({ title: 'Erro ao excluir coluna', description: error.message, variant: 'destructive' });
    }
  }

  return (
    <Draggable draggableId={String(column.id)} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="w-72 flex-shrink-0"
        >
          <div className="relative rounded-lg flex flex-col max-h-full">
            <div className="absolute inset-0 bg-black/40 dark:bg-black/50 backdrop-blur-md rounded-lg -z-10"></div>
            
            <div {...provided.dragHandleProps} className="p-2 flex items-center justify-between cursor-grab text-white dark:text-gray-200">
              {isEditingTitle ? (
                <Input
                  value={columnTitle}
                  onChange={(e) => setColumnTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle()}
                  autoFocus
                  className="bg-transparent font-semibold border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-2"
                />
              ) : (
                <h3 onClick={() => setIsEditingTitle(true)} className="font-semibold px-2 py-1">{column.titulo_coluna}</h3>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-black/20 dark:hover:bg-white/10 text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>Renomear</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteColumn} className="text-red-500">Excluir Coluna</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Droppable droppableId={String(column.id)} type="CARD">
              {(providedDrop, snapshot) => (
                <div
                  ref={providedDrop.innerRef}
                  {...providedDrop.droppableProps}
                  className={cn(
                    "px-2 py-1 space-y-2 overflow-y-auto flex-grow min-h-[50px] transition-colors duration-200"
                  )}
                >
                  {column.cards && column.cards.length > 0 && column.cards.map((card, cardIndex) => (
                    card ? <BoardCard key={card.id} card={card} index={cardIndex} refreshColumns={refreshColumns} /> : null
                  ))}
                  {providedDrop.placeholder}
                </div>
              )}
            </Droppable>
            <div className="p-2 mt-auto">
                {isAddingCard ? (
                    <div>
                        <Input 
                            placeholder="Conteúdo do cartão..." 
                            value={newCardContent} 
                            onChange={e => setNewCardContent(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleAddCard()}
                            className="mb-2 bg-card text-foreground"
                        />
                        <div className="flex items-center gap-2">
                           <Button onClick={handleAddCard}>Adicionar</Button>
                           <Button variant="ghost" size="icon" onClick={() => setIsAddingCard(false)} className="text-white hover:bg-black/20"><X className="w-5 h-5"/></Button>
                        </div>
                    </div>
                ) : (
                    <Button variant="ghost" onClick={() => setIsAddingCard(true)} className="w-full justify-start text-gray-300 dark:text-gray-400 hover:text-white hover:bg-black/20 dark:hover:bg-white/10">
                        <Plus className="w-4 h-4 mr-2" /> Adicionar um cartão
                    </Button>
                )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default BoardColumn;