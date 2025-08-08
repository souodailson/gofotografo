import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Calendar, DollarSign, Edit, MoreVertical, Trash2, Archive, Plus, Send, User, AlertTriangle, FileCheck, Link as LinkIcon, Tag, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import useCardHoverEffect from '@/hooks/useCardHoverEffect';
import { useTheme } from '@/contexts/ThemeContext';
import { twMerge } from 'tailwind-merge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipPortal } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

const getTextColorClass = (bgColor) => {
  if (!bgColor) return 'text-foreground';
  if (bgColor.includes('slate')) return 'text-foreground';
  if (bgColor.includes('yellow-300')) return 'text-yellow-800 dark:text-yellow-200';
  
  const colorName = bgColor.split('-')[1];
  if (bgColor.includes('dark')) {
    return `text-${colorName}-200`;
  }
  return `text-${colorName}-800`;
};

const getBackgroundClass = (colorClass, theme, isHover = false) => {
  if (!colorClass || colorClass.includes('slate')) return `bg-card ${isHover ? 'dark:bg-muted/30' : ''}`;

  const darkColor = colorClass.split('dark:')[1];
  if (darkColor) {
    const baseColor = darkColor.replace(/-\d+/, '');
    const lightColor = colorClass.split(' ')[0].replace(/-\d+/, '');
    if (theme === 'dark') {
      return isHover ? `${baseColor}-800` : `${baseColor}-900`;
    }
    return isHover ? `${lightColor}-200` : `${lightColor}-100`;
  }
  
  const baseColor = colorClass.replace(/-\d+/, '');
  return isHover ? `${baseColor}-200` : `${baseColor}-100`;
};

const getBorderColorClass = (colorClass, theme) => {
  if (!colorClass || colorClass.includes('slate')) return 'border-border/40';

  const darkColor = colorClass.split('dark:')[1];
  if (darkColor) {
    const baseColor = darkColor.replace(/-\d+/, '');
     if (theme === 'dark') return `border-${baseColor.split('-')[1]}-700`;
     return `border-${colorClass.split(' ')[0].split('-')[1]}-200`;
  }
  const baseColor = colorClass.replace(/-\d+/, '');
  return `border-${baseColor.split('-')[1]}-200`;
};

const CommentsTooltipContent = ({ card, onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (newComment.trim()) {
      onAddComment(card.id, newComment);
      setNewComment('');
    }
  };

  const getUserInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="p-3 rounded-lg shadow-xl w-72 max-h-96 flex flex-col bg-background/80 dark:bg-background/70 backdrop-blur-xl border border-border">
      <h4 className="font-semibold text-sm mb-2 text-foreground">Comentários</h4>
      <div className="flex-grow overflow-y-auto space-y-2 pr-2 scrollbar-thin">
        {card.comments && card.comments.length > 0 ? (
          card.comments.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).map((comment) => (
            <div key={comment.id || comment.date} className="flex items-start space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={comment.user_photo_url} alt={comment.user} />
                <AvatarFallback>{getUserInitials(comment.user)}</AvatarFallback>
              </Avatar>
              <div className="bg-muted/50 rounded-md p-2 flex-1">
                <p className="text-xs text-foreground whitespace-pre-wrap">{comment.text}</p>
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{new Date(comment.date).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum comentário ainda.</p>
        )}
      </div>
      <form onSubmit={handleAddComment} className="mt-2 pt-2 border-t border-border flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Adicionar comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="h-8 text-xs flex-grow bg-background/50"
        />
        <Button type="submit" size="icon" className="h-8 w-8" disabled={!newComment.trim()}>
          <Send size={14} />
        </Button>
      </form>
    </div>
  );
};

const WorkflowCard = ({
  card,
  onEdit,
  onUpdateSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onDeleteCard,
  onArchiveCard,
  columnColor,
  onAddComment,
  viewMode
}) => {
  const { getClientById, getServicePackageById, financialData } = useData();
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const cardRef = useCardHoverEffect();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const client = card.client_id ? getClientById(card.client_id) : null;
  const servicePackage = card.service_package_id ? getServicePackageById(card.service_package_id) : null;
  const transaction = financialData.transactions.find((t) => t.workflow_id === card.id);

  const cardBgColor = getBackgroundClass(columnColor, theme, false);
  const cardHoverBgColor = getBackgroundClass(columnColor, theme, true);
  const cardBorderColor = getBorderColorClass(columnColor, theme);
  const cardTextColor = getTextColorClass(columnColor);

  const getTagColor = (tag) => {
    const colors = {
      Casamento: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      Gestante: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      Empresarial: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
      'Ensaio Externo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Corporativo: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Estúdio: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Produto: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    if (client && client.phone) {
      const cleanPhone = client.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    } else {
      alert('Número de WhatsApp do cliente não disponível.');
    }
  };
  const daysUntilEvent = card.date ? differenceInCalendarDays(parseISO(card.date), new Date()) : null;

  let eventAlert = null;
  if (daysUntilEvent !== null && daysUntilEvent >= 0 && daysUntilEvent <= 7) {
    eventAlert = {
      message:
        daysUntilEvent === 0 ? 'Evento é Hoje!' : `Evento em ${daysUntilEvent} dia${daysUntilEvent !== 1 ? 's' : ''}`,
      color: daysUntilEvent <= 3 ? 'text-red-500 dark:text-red-400' : 'text-yellow-500 dark:text-yellow-400'
    };
  }

  const handleAddNewSubtask = (e) => {
    e.stopPropagation();
    if (newSubtaskText.trim() === '') return;
    onAddSubtask(card.id, newSubtaskText);
    setNewSubtaskText('');
  };
  const confirmDeleteAction = () => {
    onDeleteCard(card.id);
    setShowDeleteConfirm(false);
  };

  const handleNavigateToContracts = (e) => {
    e.stopPropagation();
    // Ao criar um contrato a partir do card do workflow, navegar para o editor
    // em /studio/contracts/new. A rota antiga (/contracts/new) não existia.
    navigate('/studio/contracts/new', {
      state: { clientId: card.client_id, workflowCardId: card.id }
    });
  };

  const CardContentLayout = ({ children }) => <div className="flex flex-col space-y-2">{children}</div>;

  const cardClasses = twMerge(
    `rounded-lg p-3 sm:p-4 border cursor-pointer transition-all duration-200 group card-hover-effect`,
    cardBgColor,
    cardTextColor,
    cardBorderColor,
    `hover:${cardHoverBgColor}`
  );

  if (viewMode === 'summarized') {
    return (
      <motion.div ref={cardRef} className={cardClasses} onClick={() => onEdit(card)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm break-words leading-tight truncate">
              {card.title || (client ? client.name : 'Título não definido')}
            </h4>
            {client && (
              <div className="text-xs text-current/80 flex items-center truncate">
                <User size={12} className="mr-1.5 flex-shrink-0" /> {client.name}
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onEdit(card)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchiveCard(card.id)}>
                <Archive className="mr-2 h-4 w-4" /> Arquivar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 dark:text-red-400 hover:!text-red-600 focus:text-red-600 dark:focus:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div ref={cardRef} className={cardClasses} onClick={() => onEdit(card)}>
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm flex-1 break-words leading-tight">
            {card.title || (client ? client.name : 'Título não definido')}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onEdit(card)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchiveCard(card.id)}>
                <Archive className="mr-2 h-4 w-4" /> Arquivar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 dark:text-red-400 hover:!text-red-600 focus:text-red-600 dark:focus:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardContentLayout>
          {client && (
            <div className="text-xs text-current/80 flex items-center">
              <User size={12} className="mr-1.5" /> {client.name}
            </div>
          )}
          {servicePackage && (
            <div className="text-xs text-current/80">Pacote: {servicePackage.name}</div>
          )}
          {card.description && (
            <p className="text-xs text-current/80 line-clamp-2">{card.description}</p>
          )}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getTagColor(tag)}`}
                >
                  <Tag className="w-2.5 h-2.5 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <DollarSign className="w-3.5 h-3.5 mr-1" />
              <span className="font-semibold text-xs sm:text-sm">
                R$ {Number(card.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {card.date && (
              <div className="flex items-center text-current/80">
                <Calendar className="w-3 h-3 mr-1" />
                <span className="text-xs">{format(parseISO(card.date), 'dd/MM/yy')}</span>
                {card.time && <span className="text-xs ml-1">({card.time})</span>}
              </div>
            )}
          </div>

          <div className="space-y-1 text-xs">
            {eventAlert && (
              <div className={`flex items-center ${eventAlert.color}`}>
                <AlertTriangle size={12} className="mr-1" /> {eventAlert.message}
              </div>
            )}
            {transaction && (
              <div
                className={`flex items-center ${
                  transaction.paid
                    ? 'text-green-500 dark:text-green-400'
                    : 'text-orange-500 dark:text-orange-400'
                }`}
              >
                <DollarSign size={12} className="mr-1" /> Pagamento:{' '}
                {transaction.paid ? 'Pago' : 'Pendente'}
              </div>
            )}
          </div>

          <div className="mt-2 text-xs">
            <h5 className="font-semibold mb-1 text-current/90">Contrato e Observações</h5>
            <div className="space-y-1">
              {card.contract_url ? (
                <a
                  href={card.contract_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-customPurple hover:underline flex items-center text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LinkIcon size={12} className="mr-1" /> Ver Contrato:{' '}
                  {card.contract_name || 'Contrato'} ({card.contract_status || 'Status desconhecido'})
                </a>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-xs text-customPurple"
                  onClick={handleNavigateToContracts}
                >
                  <FileText size={12} className="mr-1" /> Criar Contrato
                </Button>
              )}
            </div>
          </div>

          <div>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs text-neutral-600 dark:text-purple-400"
              onClick={(e) => {
                e.stopPropagation();
                setShowSubtasks(!showSubtasks);
              }}
            >
              {showSubtasks ? 'Ocultar' : 'Mostrar'} Subtarefas ({card.subtasks?.length || 0})
            </Button>
            {showSubtasks && (
              <div className="mt-1 space-y-1 pl-1 border-l-2 border-border dark:border-slate-600">
                {(card.subtasks || []).map((subtask) => (
                  <div key={subtask.id} className="flex items-center justify-between text-xs group/subtask">
                    <label className="flex items-center space-x-1.5 text-current/80 cursor-pointer">
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={(checked) => {
                          onUpdateSubtask(card.id, subtask.id, checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className={subtask.completed ? 'line-through text-current/60' : ''}>
                        {subtask.text}
                      </span>
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-5 h-5 opacity-0 group-hover/subtask:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSubtask(card.id, subtask.id);
                      }}
                    >
                      <Trash2 size={12} className="text-red-500" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center space-x-1 pt-1">
                  <Input
                    type="text"
                    placeholder="Nova subtarefa..."
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleAddNewSubtask(e);
                    }}
                    className="h-6 text-xs flex-grow bg-background"
                  />
                  <Button variant="ghost" size="icon" className="w-5 h-5" onClick={handleAddNewSubtask}>
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-current/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWhatsAppClick}
              className="text-green-600 hover:text-green-700 p-1 h-auto"
              disabled={!client || !client.phone}
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </Button>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center text-current/80 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    <span className="text-xs">{card.comments?.length || 0}</span>
                  </div>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="p-0 bg-transparent border-none shadow-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CommentsTooltipContent card={card} onAddComment={onAddComment} />
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          </div>
          {card.history && card.history.length > 0 && (
            <div className="mt-1 text-[10px] text-current/60">
              Última atualização:{' '}
              {format(parseISO(card.history[card.history.length - 1].date), 'dd/MM/yy HH:mm')}
            </div>
          )}
        </CardContentLayout>
      </motion.div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(false);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                confirmDeleteAction();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorkflowCard;
