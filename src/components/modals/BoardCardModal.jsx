import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, CheckSquare, Square, Plus, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Checkbox } from '@/components/ui/checkbox';
import { v4 as uuidv4 } from 'uuid';

const BoardCardModal = ({ isOpen, onClose, cardId, refreshBoard }) => {
  const { toast } = useToast();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [cardType, setCardType] = useState('nota');
  const [noteContent, setNoteContent] = useState('');
  const [checklistTitle, setChecklistTitle] = useState('');
  const [checklistItems, setChecklistItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');

  const debouncedNoteContent = useDebounce(noteContent, 500);
  const debouncedChecklistTitle = useDebounce(checklistTitle, 500);
  const debouncedChecklistItems = useDebounce(checklistItems, 500);
  const isInitialMount = useRef(true);

  const fetchCardDetails = useCallback(async () => {
    if (!cardId) return;
    setLoading(true);
    isInitialMount.current = true;
    try {
      const { data, error } = await supabase.from('quadro_cards').select('*, coluna:quadro_colunas(titulo_coluna)').eq('id', cardId).single();
      if (error) throw error;
      setCard(data);
      const type = data.tipo_card || 'nota';
      setCardType(type);
      if (type === 'checklist') {
        setChecklistTitle(data.titulo || '');
        setChecklistItems(Array.isArray(data.conteudo) ? data.conteudo : []);
      } else {
        setNoteContent(typeof data.conteudo === 'string' ? data.conteudo : '');
      }
    } catch (error) {
      toast({ title: 'Erro ao carregar cartão', description: error.message, variant: 'destructive' });
      onClose();
    } finally {
      setLoading(false);
      setTimeout(() => { isInitialMount.current = false; }, 500);
    }
  }, [cardId, toast, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchCardDetails();
    }
  }, [isOpen, fetchCardDetails]);

  const updateCardDetails = useCallback(async (updates) => {
    try {
      const { error } = await supabase.from('quadro_cards').update(updates).eq('id', cardId);
      if (error) throw error;
    } catch (error) {
      toast({ title: 'Erro ao salvar alterações', description: error.message, variant: 'destructive' });
    }
  }, [cardId, toast]);

  useEffect(() => {
    if (!isInitialMount.current && card) {
      if (cardType === 'nota' && debouncedNoteContent !== card.conteudo) {
        updateCardDetails({ conteudo: debouncedNoteContent, tipo_card: 'nota' });
      } else if (cardType === 'checklist') {
        if (debouncedChecklistTitle !== card.titulo || JSON.stringify(debouncedChecklistItems) !== JSON.stringify(card.conteudo)) {
          updateCardDetails({ titulo: debouncedChecklistTitle, conteudo: debouncedChecklistItems, tipo_card: 'checklist' });
        }
      }
    }
  }, [debouncedNoteContent, debouncedChecklistTitle, debouncedChecklistItems, card, cardType, updateCardDetails]);
  
  const handleDeleteCard = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('quadro_cards').delete().eq('id', cardId);
      if (error) throw error;
      toast({ title: 'Cartão excluído!', description: 'O cartão foi removido com sucesso.' });
      refreshBoard();
      onClose();
    } catch (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    refreshBoard();
    onClose();
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      setChecklistItems([...checklistItems, { id: uuidv4(), text: newItemText, completed: false }]);
      setNewItemText('');
    }
  };

  const handleToggleItem = (itemId) => {
    setChecklistItems(checklistItems.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item));
  };

  const handleRemoveItem = (itemId) => {
    setChecklistItems(checklistItems.filter(item => item.id !== itemId));
  };

  const handleCardTypeChange = (newType) => {
    if (newType === cardType) return;
    setCardType(newType);
    const updates = { tipo_card: newType };
    if (newType === 'checklist') {
      updates.titulo = noteContent.split('\n')[0] || 'Nova Checklist';
      updates.conteudo = noteContent.split('\n').slice(1).map(line => ({ id: uuidv4(), text: line, completed: false })).filter(item => item.text);
      setChecklistTitle(updates.titulo);
      setChecklistItems(updates.conteudo);
    } else {
      updates.conteudo = `${checklistTitle}\n${checklistItems.map(item => `- ${item.text}`).join('\n')}`;
      setNoteContent(updates.conteudo);
    }
    updateCardDetails(updates);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px]">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : card ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {cardType === 'nota' ? 'Editar Nota' : 'Editar Checklist'}
              </DialogTitle>
              <DialogDescription>
                na coluna: {card.coluna?.titulo_coluna || '...'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex items-center space-x-2 my-4">
              <Button variant={cardType === 'nota' ? 'default' : 'outline'} onClick={() => handleCardTypeChange('nota')}>Nota Simples</Button>
              <Button variant={cardType === 'checklist' ? 'default' : 'outline'} onClick={() => handleCardTypeChange('checklist')}>Checklist</Button>
            </div>

            <div className="py-4 space-y-4">
              {cardType === 'nota' ? (
                <div>
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea
                    id="content"
                    placeholder="Adicione o conteúdo do cartão..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="mt-1 min-h-[150px]"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="checklist-title">Título da Checklist</Label>
                    <Input
                      id="checklist-title"
                      value={checklistTitle}
                      onChange={(e) => setChecklistTitle(e.target.value)}
                      className="mt-1 font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    {checklistItems.map(item => (
                      <div key={item.id} className="flex items-center group">
                        <Checkbox id={`item-${item.id}`} checked={item.completed} onCheckedChange={() => handleToggleItem(item.id)} className="mr-2" />
                        <label htmlFor={`item-${item.id}`} className={`flex-grow ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.text}</label>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveItem(item.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Adicionar item..."
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                    />
                    <Button onClick={handleAddItem} size="icon"><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-between w-full">
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDeleteCard} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Trash2 className="w-4 h-4 mr-2"/>}
                Excluir Cartão
              </Button>
              <Button onClick={handleClose}>Fechar</Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default BoardCardModal;