import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/authContext';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  X, 
  CreditCard, 
  Palette, 
  Tag as TagIcon, 
  User, 
  Calendar as CalendarIcon, 
  MessageSquare,
  Archive,
  Copy,
  Eye,
  List,
  CheckSquare,
  Square,
  Plus
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Checkbox } from '@/components/ui/checkbox';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

const predefinedColors = [
  { name: 'Azul', value: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Verde', value: '#10b981', bg: 'bg-green-500' },
  { name: 'Vermelho', value: '#ef4444', bg: 'bg-red-500' },
  { name: 'Amarelo', value: '#f59e0b', bg: 'bg-yellow-500' },
  { name: 'Roxo', value: '#8b5cf6', bg: 'bg-purple-500' },
  { name: 'Rosa', value: '#ec4899', bg: 'bg-pink-500' },
  { name: 'Laranja', value: '#f97316', bg: 'bg-orange-500' },
  { name: 'Cinza', value: '#6b7280', bg: 'bg-gray-500' },
];

const tagColors = [
  { name: 'Verde', value: '#10b981', textColor: '#ffffff' },
  { name: 'Azul', value: '#3b82f6', textColor: '#ffffff' },
  { name: 'Vermelho', value: '#ef4444', textColor: '#ffffff' },
  { name: 'Amarelo', value: '#f59e0b', textColor: '#000000' },
  { name: 'Roxo', value: '#8b5cf6', textColor: '#ffffff' },
  { name: 'Rosa', value: '#ec4899', textColor: '#ffffff' },
  { name: 'Laranja', value: '#f97316', textColor: '#ffffff' },
  { name: 'Turquesa', value: '#06b6d4', textColor: '#ffffff' },
  { name: 'Lime', value: '#84cc16', textColor: '#000000' },
  { name: 'Índigo', value: '#6366f1', textColor: '#ffffff' },
];

const predefinedTags = [
  { text: 'Urgente', color: '#ef4444' },
  { text: 'Em Progresso', color: '#f59e0b' },
  { text: 'Concluído', color: '#10b981' },
  { text: 'Revisão', color: '#8b5cf6' },
  { text: 'Bug', color: '#ef4444' },
  { text: 'Feature', color: '#3b82f6' },
  { text: 'Bloqueado', color: '#6b7280' },
  { text: 'Importante', color: '#ec4899' },
];

const priorities = [
  { value: 'baixa', label: 'Baixa', color: 'text-green-600' },
  { value: 'media', label: 'Média', color: 'text-yellow-600' },
  { value: 'alta', label: 'Alta', color: 'text-orange-600' },
  { value: 'critica', label: 'Crítica', color: 'text-red-600' },
];

const BoardCardModal = ({ isOpen, onClose, cardId, refreshBoard }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [cardType, setCardType] = useState('nota');
  const [cardDescription, setCardDescription] = useState('');
  const [checklistTitle, setChecklistTitle] = useState('');
  const [checklistItems, setChecklistItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');

  // Estados para customização
  const [customizacao, setCustomizacao] = useState({
    cor: '#3b82f6',
    tags: [],
    prioridade: 'media',
    observacoes: '',
    dataVencimento: '',
    comentarios: []
  });
  const [newTag, setNewTag] = useState('');
  const [newComment, setNewComment] = useState('');
  
  // Estados para UI
  const [editingTitle, setEditingTitle] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [showTagsInput, setShowTagsInput] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isInitialMount = useRef(true);

  const fetchCardDetails = useCallback(async () => {
    if (!cardId) return;
    setLoading(true);
    isInitialMount.current = true;
    try {
      const { data, error } = await supabase.from('quadro_cards').select('*, coluna:quadro_colunas(titulo_coluna)').eq('id', cardId).single();
      if (error) throw error;
      setCard(data);
      setHasUnsavedChanges(false); // Reset ao carregar dados frescos
      
      const type = (data.conteudo?.type === 'checklist') ? 'checklist' : 'nota';
      setCardType(type);
      
      // Definir título, descrição e conteúdo baseado no tipo do card
      let cardTitle = '';
      let description = '';
      
      if (type === 'checklist') {
        const titulo = data.conteudo?.title || data.titulo || '';
        const items = data.conteudo?.items || [];
        setChecklistTitle(titulo);
        setChecklistItems(Array.isArray(items) ? items : []);
        cardTitle = titulo;
        description = data.conteudo?.description || '';
      } else {
        // Para notas, usar o titulo se existir, senão primeira linha do conteúdo (migração)
        cardTitle = data.titulo || '';
        
        const conteudo = data.conteudo;
        
        if (typeof conteudo === 'object') {
          description = conteudo?.description || '';
          // Se não há título definido, usar primeira linha do conteúdo como título (migração)
          if (!cardTitle && conteudo?.text) {
            const lines = conteudo.text.split('\n');
            cardTitle = lines[0] || '';
          }
        } else if (typeof conteudo === 'string') {
          // Migração de dados legados - usar primeira linha como título
          if (!cardTitle && conteudo) {
            const lines = conteudo.split('\n');
            cardTitle = lines[0] || '';
          }
        }
      }
      
      setCardTitle(cardTitle || 'Sem título');
      setCardDescription(description);

      // Carregar customização
      const customizacaoData = data.customizacao || {};
      
      setCustomizacao({
        cor: customizacaoData.cor || '#3b82f6',
        tags: customizacaoData.tags || [],
        prioridade: customizacaoData.prioridade || 'media',
        observacoes: customizacaoData.observacoes || '',
        dataVencimento: customizacaoData.dataVencimento || '',
        comentarios: customizacaoData.comentarios || []
      });
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
      // Atualizar o estado local para refletir as mudanças
      setCard(prev => ({ ...prev, ...updates }));
      
      // Atualizar o board para refletir as mudanças
      if (refreshBoard) refreshBoard();
      
    } catch (error) {
      toast({ title: 'Erro ao salvar alterações', description: error.message, variant: 'destructive' });
    }
  }, [cardId, toast, refreshBoard]);

  // Função para salvar todas as alterações
  const handleSaveCard = useCallback(async () => {
    if (!hasUnsavedChanges || isSaving) return;
    
    setIsSaving(true);
    try {
      const updates = {};
      
      if (cardType === 'nota') {
        updates.conteudo = { 
          ...card.conteudo,
          text: cardTitle,
          description: cardDescription
        };
      } else if (cardType === 'checklist') {
        updates.conteudo = { 
          type: 'checklist',
          title: checklistTitle, 
          items: checklistItems,
          description: cardDescription
        };
      }
      
      updates.customizacao = customizacao;
      
      await updateCardDetails(updates);
      setHasUnsavedChanges(false);
      toast({ title: 'Cartão salvo!', description: 'Suas alterações foram salvas com sucesso.' });
    } catch (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [cardType, cardDescription, checklistTitle, checklistItems, customizacao, hasUnsavedChanges, isSaving, updateCardDetails, toast, cardTitle]);

  // Detectar mudanças para marcar como não salvo
  useEffect(() => {
    if (!isInitialMount.current) {
      setHasUnsavedChanges(true);
    }
  }, [cardDescription, checklistTitle, checklistItems, customizacao, cardTitle]);
  
  const handleDeleteCard = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('quadro_cards')
        .update({ arquivado: true, arquivado_em: new Date().toISOString() })
        .eq('id', cardId);
      if (error) throw error;
      toast({ title: 'Cartão arquivado!', description: 'O cartão foi arquivado com sucesso.' });
      refreshBoard();
      onClose();
    } catch (error) {
      toast({ title: 'Erro ao arquivar', description: error.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUnarchiveCard = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('quadro_cards')
        .update({ arquivado: false, arquivado_em: null })
        .eq('id', cardId);
      if (error) throw error;
      toast({ title: 'Cartão desarquivado!', description: 'O cartão foi restaurado com sucesso.' });
      refreshBoard();
      onClose();
    } catch (error) {
      toast({ title: 'Erro ao desarquivar', description: error.message, variant: 'destructive' });
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
    const updates = {};
    if (newType === 'checklist') {
      const titulo = noteContent.split('\n')[0] || 'Nova Checklist';
      const items = noteContent.split('\n').slice(1).map(line => ({ id: uuidv4(), text: line, completed: false })).filter(item => item.text);
      updates.titulo = titulo;
      updates.conteudo = { type: 'checklist', title: titulo, items: items };
      setChecklistTitle(titulo);
      setChecklistItems(items);
    } else {
      const textContent = `${checklistTitle}\n${checklistItems.map(item => `- ${item.text}`).join('\n')}`;
      updates.conteudo = { text: textContent };
      setNoteContent(textContent);
    }
    updateCardDetails(updates);
  };

  // Funções de customização
  const handleUpdateCustomizacao = (updates) => {
    const newCustomizacao = { ...customizacao, ...updates };
    setCustomizacao(newCustomizacao);
    if (!isInitialMount.current) {
      setHasUnsavedChanges(true);
    }
  };

  const handleAddTag = (tagText, tagColor = null) => {
    const text = tagText || newTag.trim();
    if (text && !customizacao.tags.some(tag => tag.text === text)) {
      const newTagObj = {
        text: text,
        color: tagColor || tagColors[Math.floor(Math.random() * tagColors.length)].value,
        id: uuidv4()
      };
      handleUpdateCustomizacao({
        tags: [...customizacao.tags, newTagObj]
      });
      setNewTag('');
    }
  };

  const handleAddPredefinedTag = (predefinedTag) => {
    if (!customizacao.tags.some(tag => tag.text === predefinedTag.text)) {
      const newTagObj = {
        text: predefinedTag.text,
        color: predefinedTag.color,
        id: uuidv4()
      };
      handleUpdateCustomizacao({
        tags: [...customizacao.tags, newTagObj]
      });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    handleUpdateCustomizacao({
      tags: customizacao.tags.filter(tag => tag.id !== tagToRemove.id)
    });
  };

  const handleAddComment = () => {
    const comment = {
      id: uuidv4(),
      texto: '',
      timestamp: new Date().toISOString(),
      autor: user?.user_metadata?.full_name || user?.email || 'Usuário',
      autorId: user?.id
    };
    handleUpdateCustomizacao({
      comentarios: [...customizacao.comentarios, comment]
    });
  };

  const handleAddNewComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: uuidv4(),
      texto: newComment.trim(),
      timestamp: new Date().toISOString(),
      autor: user?.user_metadata?.full_name || user?.email || 'Usuário',
      autorId: user?.id
    };
    
    handleUpdateCustomizacao({
      comentarios: [...customizacao.comentarios, comment]
    });
    
    setNewComment('');
  };

  const handleUpdateComment = (commentId, texto) => {
    handleUpdateCustomizacao({
      comentarios: customizacao.comentarios.map(comment => 
        comment.id === commentId ? { ...comment, texto } : comment
      )
    });
  };

  const handleRemoveComment = (commentId) => {
    handleUpdateCustomizacao({
      comentarios: customizacao.comentarios.filter(comment => comment.id !== commentId)
    });
  };

  const handleSaveTitle = async () => {
    setEditingTitle(false);
    if (!cardTitle.trim()) return;
    
    try {
      if (cardType === 'checklist') {
        const updatedContent = { 
          ...card.conteudo, 
          title: cardTitle.trim() 
        };
        const { error } = await supabase
          .from('quadro_cards')
          .update({ conteudo: updatedContent })
          .eq('id', cardId);
        if (error) throw error;
        setChecklistTitle(cardTitle.trim());
        setCard(prev => ({ ...prev, conteudo: updatedContent }));
      } else {
        // Para notas, atualizar o campo text no conteúdo
        const updatedContent = { 
          ...card.conteudo, 
          text: cardTitle.trim() 
        };
        const { error } = await supabase
          .from('quadro_cards')
          .update({ conteudo: updatedContent })
          .eq('id', cardId);
        if (error) throw error;
        setCard(prev => ({ ...prev, conteudo: updatedContent }));
      }
    } catch (error) {
      toast({ title: 'Erro ao salvar título', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[768px] max-h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {cardTitle || 'Editar Cartão'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Modal para editar o cartão na coluna {card?.coluna?.titulo_coluna}
        </DialogDescription>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : card ? (
          <div className="flex h-[600px]">
            {/* Área principal do card */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="space-y-6">
                {/* Header com ícone e título editável */}
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-sm"
                    style={{ backgroundColor: customizacao.cor }}
                  />
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    {editingTitle ? (
                      <Input
                        value={cardTitle}
                        onChange={(e) => setCardTitle(e.target.value)}
                        onBlur={handleSaveTitle}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
                        className="text-lg font-semibold border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                        autoFocus
                      />
                    ) : (
                      <h2 
                        className="text-lg font-semibold cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
                        onDoubleClick={() => setEditingTitle(true)}
                      >
                        {cardTitle || (cardType === 'nota' ? 'Nota sem título' : 'Lista sem título')}
                      </h2>
                    )}
                    <p className="text-sm text-muted-foreground">
                      na coluna <span className="underline">{card.coluna?.titulo_coluna}</span>
                    </p>
                  </div>
                </div>

                {/* Etiquetas */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Etiquetas</span>
                  </div>
                  
                  {/* Etiquetas atuais */}
                  {customizacao.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customizacao.tags.map((tag) => (
                        <div
                          key={tag.id || tag.text}
                          className="group relative"
                        >
                          <Badge 
                            className="px-3 py-1 text-xs rounded-full cursor-pointer transition-all hover:scale-105"
                            style={{ 
                              backgroundColor: tag.color || '#6b7280', 
                              color: tag.color ? (tag.color === '#f59e0b' || tag.color === '#84cc16' ? '#000' : '#fff') : '#fff',
                              border: 'none'
                            }}
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag.text || tag}
                            <X className="w-3 h-3 ml-1 opacity-70 hover:opacity-100" />
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Etiquetas pré-definidas */}
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Etiquetas rápidas:</span>
                    <div className="flex flex-wrap gap-1">
                      {predefinedTags.map((predefinedTag, index) => (
                        <button
                          key={index}
                          onClick={() => handleAddPredefinedTag(predefinedTag)}
                          className="px-2 py-1 text-xs rounded-full border transition-all hover:scale-105"
                          style={{ 
                            backgroundColor: `${predefinedTag.color}20`,
                            borderColor: predefinedTag.color,
                            color: predefinedTag.color
                          }}
                        >
                          + {predefinedTag.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input para etiqueta personalizada */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova etiqueta..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="text-xs h-8 flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag();
                        }
                      }}
                    />
                    <Button 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleAddTag()}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Descrição */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <List className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Descrição</span>
                  </div>
                  
                  <Textarea
                    placeholder="Adicione uma descrição mais detalhada..."
                    value={cardDescription}
                    onChange={(e) => setCardDescription(e.target.value)}
                    className="min-h-[80px] resize-none border-none focus-visible:ring-1"
                  />
                </div>

                {/* Lista de tarefas (apenas para checklists) */}
                {cardType === 'checklist' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <List className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Lista de tarefas</span>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        {checklistItems.map(item => (
                          <div key={item.id} className="flex items-center gap-3 group">
                            <Checkbox 
                              id={`item-${item.id}`} 
                              checked={item.completed} 
                              onCheckedChange={() => handleToggleItem(item.id)} 
                            />
                            <label 
                              htmlFor={`item-${item.id}`} 
                              className={cn(
                                "flex-1 cursor-pointer",
                                item.completed && "line-through text-muted-foreground"
                              )}
                            >
                              {item.text}
                            </label>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0" 
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Adicionar item..."
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                          className="flex-1"
                        />
                        <Button onClick={handleAddItem} size="sm">
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comentários */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Comentários</span>
                  </div>
                  
                  {/* Comentários existentes */}
                  {customizacao.comentarios?.length > 0 && (
                    <div className="space-y-4">
                      {customizacao.comentarios.map((comment) => (
                        <div key={comment.id} className="bg-transparent rounded-xl p-4 shadow-sm border border-gray-100/20 dark:border-white/10">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {user?.user_metadata?.avatar_url ? (
                                <img 
                                  src={user.user_metadata.avatar_url} 
                                  alt={comment.autor}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-medium shadow-sm">
                                  {comment.autor?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.autor}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(comment.timestamp).toLocaleString()}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    onClick={() => handleRemoveComment(comment.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <Textarea
                                value={comment.texto}
                                onChange={(e) => handleUpdateComment(comment.id, e.target.value)}
                                placeholder="Escreva um comentário..."
                                className="text-sm min-h-[60px] resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:outline-none p-0 text-gray-700 dark:text-gray-300"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Nova caixa de comentário sempre visível */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {user?.user_metadata?.avatar_url ? (
                          <img 
                            src={user.user_metadata.avatar_url} 
                            alt={user?.user_metadata?.full_name || user?.email || 'Você'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-medium shadow-sm">
                            {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user?.user_metadata?.full_name || user?.email || 'Você'}
                          </span>
                        </div>
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Adicione um comentário..."
                          className="text-sm min-h-[80px] resize-none border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent p-3 transition-all"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddNewComment();
                            }
                          }}
                        />
                        {newComment.trim() && (
                          <div className="flex justify-end mt-3">
                            <Button 
                              size="sm" 
                              onClick={handleAddNewComment}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              Comentar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar de ações */}
            <div className="w-48 bg-muted/30 p-4 border-l">
              <div className="space-y-4">
                {/* Botão Salvar */}
                <div className="space-y-2">
                  <Button 
                    onClick={handleSaveCard}
                    disabled={!hasUnsavedChanges || isSaving}
                    className="w-full"
                    variant={hasUnsavedChanges ? "default" : "secondary"}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : hasUnsavedChanges ? (
                      'Salvar Alterações'
                    ) : (
                      'Salvo'
                    )}
                  </Button>
                  {hasUnsavedChanges && (
                    <p className="text-xs text-orange-600 text-center">
                      Há alterações não salvas
                    </p>
                  )}
                </div>

                {/* Seletor de cores sempre visível */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    Cor do cartão
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color.value}
                        className={cn(
                          "w-full h-8 rounded transition-all duration-200 border-2",
                          color.bg,
                          customizacao.cor === color.value ? "ring-2 ring-foreground ring-offset-2" : "border-transparent"
                        )}
                        onClick={() => {
                          handleUpdateCustomizacao({ cor: color.value });
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Adicionar ao cartão</h3>
                  <div className="space-y-2">
                  </div>
                </div>



                {/* Data de vencimento sempre visível */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Data de vencimento</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      type="datetime-local"
                      value={customizacao.dataVencimento}
                      onChange={(e) => {
                        const newCustomizacao = { ...customizacao, dataVencimento: e.target.value };
                        setCustomizacao(newCustomizacao);
                        if (!isInitialMount.current) {
                          setHasUnsavedChanges(true);
                        }
                      }}
                      className="text-sm h-10"
                    />
                    
                    {customizacao.dataVencimento && (
                      <div className="flex items-center justify-between bg-muted/30 rounded p-2">
                        <span className="text-sm text-muted-foreground">
                          Vence em: {new Date(customizacao.dataVencimento).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const newCustomizacao = { ...customizacao, dataVencimento: '' };
                            setCustomizacao(newCustomizacao);
                            if (!isInitialMount.current) {
                              setHasUnsavedChanges(true);
                            }
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Ações</h3>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleCardTypeChange(cardType === 'nota' ? 'checklist' : 'nota')}
                    >
                      {cardType === 'nota' ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                      {cardType === 'nota' ? 'Converter em Lista' : 'Converter em Nota'}
                    </Button>
                    {card?.arquivado ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-green-600 hover:text-green-600"
                        onClick={handleUnarchiveCard}
                        disabled={isDeleting}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        {isDeleting ? 'Restaurando...' : 'Desarquivar'}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={handleDeleteCard}
                        disabled={isDeleting}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        {isDeleting ? 'Arquivando...' : 'Arquivar'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de fechar */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default BoardCardModal;