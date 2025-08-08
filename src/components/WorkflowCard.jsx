import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Calendar, Paperclip, Tag, DollarSign, Edit, Clock, User, AlertTriangle, FileCheck, CheckSquare, Trash2, Plus, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const WorkflowCard = ({ card, onEdit, onUpdateSubtask, onAddSubtask, onDeleteSubtask, onDeleteCard, onArchiveCard }) => {
  const { getClientById, getServicePackageById, financialData } = useData();
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const client = card.client_id ? getClientById(card.client_id) : null;
  const servicePackage = card.service_package_id ? getServicePackageById(card.service_package_id) : null;
  const transaction = financialData.transactions.find(t => t.workflow_id === card.id);

  const getTagColor = (tag) => {
    const colors = {
      'Casamento': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Gestante': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'Empresarial': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
      'Ensaio Externo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Corporativo': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Estúdio': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Produto': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const handleWhatsAppClick = (e) => {
    e.stopPropagation(); 
    if (client && client.phone) {
      const cleanPhone = client.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    } else {
      alert("Número de WhatsApp do cliente não disponível.");
    }
  };

  const daysUntilEvent = card.date ? Math.ceil((new Date(new Date(card.date).toDateString()) - new Date(new Date().toDateString())) / (1000 * 60 * 60 * 24)) : null;

  let eventAlert = null;
  if (daysUntilEvent !== null && daysUntilEvent >= 0 && daysUntilEvent <= 7) {
    eventAlert = {
      message: daysUntilEvent === 0 ? 'Evento é Hoje!' : `Evento em ${daysUntilEvent} dia${daysUntilEvent !== 1 ? 's' : ''}`,
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

  return (
    <>
      <motion.div
        onClick={() => onEdit(card)}
        whileHover={{ scale: 1.02, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
        className="bg-card rounded-lg p-4 border border-border cursor-pointer transition-all duration-200 group"
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-medium text-foreground text-sm flex-1 break-words">
            {card.title || (client ? client.name : "Título não definido")}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
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
              <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-red-600 dark:text-red-400 hover:!text-red-600 focus:text-red-600 dark:focus:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {client && (
          <div className="text-xs text-muted-foreground mb-2 flex items-center">
            <User size={12} className="mr-1" /> {client.name}
          </div>
        )}
        
        {servicePackage && (
           <div className="text-xs text-muted-foreground mb-2">
            Pacote: {servicePackage.name}
          </div>
        )}

        {card.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {card.description}
          </p>
        )}

        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {card.tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-green-600 dark:text-green-400">
            <DollarSign className="w-4 h-4 mr-1" />
            <span className="font-semibold text-sm">
              R$ {Number(card.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          {card.date && (
            <div className="flex items-center text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              <span className="text-xs">
                {new Date(new Date(card.date).setDate(new Date(card.date).getDate()+1)).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1 mb-3 text-xs">
          {eventAlert && (
            <div className={`flex items-center ${eventAlert.color}`}>
              <AlertTriangle size={12} className="mr-1" /> {eventAlert.message}
            </div>
          )}
          {card.contract_status && (
            <div className={`flex items-center ${card.contract_status === 'signed' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-500 dark:text-orange-400'}`}>
              <FileCheck size={12} className="mr-1" /> Contrato: {card.contract_status === 'signed' ? 'Assinado' : card.contract_status === 'pending' ? 'Pendente' : card.contract_status || 'Não especificado'}
            </div>
          )}
          {transaction && (
            <div className={`flex items-center ${transaction.paid ? 'text-green-500 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
              <DollarSign size={12} className="mr-1" /> Pagamento: {transaction.paid ? 'Pago' : 'Pendente'}
            </div>
          )}
        </div>
        
        <div className="mb-3">
          <Button variant="link" size="sm" className="p-0 h-auto text-xs text-neutral-600 dark:text-purple-400" onClick={(e) => {e.stopPropagation(); setShowSubtasks(!showSubtasks);}}>
            {showSubtasks ? 'Ocultar' : 'Mostrar'} Subtarefas ({card.subtasks?.length || 0})
          </Button>
          {showSubtasks && (
            <div className="mt-2 space-y-1 pl-2 border-l-2 border-border">
              {(card.subtasks || []).map((subtask, index) => (
                <div key={index} className="flex items-center justify-between text-xs group/subtask">
                  <label className="flex items-center space-x-2 text-muted-foreground cursor-pointer">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={(checked) => {onUpdateSubtask(card.id, index, checked)}}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className={subtask.completed ? 'line-through text-slate-500' : ''}>
                      {subtask.text}
                    </span>
                  </label>
                  <Button variant="ghost" size="icon" className="w-5 h-5 opacity-0 group-hover/subtask:opacity-100" onClick={(e) => {e.stopPropagation(); onDeleteSubtask(card.id, index);}}>
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
                  onKeyPress={(e) => { if (e.key === 'Enter') handleAddNewSubtask(e);}}
                  className="h-7 text-xs flex-grow"
                />
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={handleAddNewSubtask}>
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWhatsAppClick}
            className="text-green-600 hover:text-green-700 p-1 h-auto"
            disabled={!client || !client.phone}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            <span className="text-xs">
              {card.comments?.length || 0} comentários
            </span>
          </div>
        </div>

        {card.history && card.history.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            Última atualização: {new Date(card.history[card.history.length - 1].date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
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
            <AlertDialogCancel onClick={(e) => {e.stopPropagation(); setShowDeleteConfirm(false)}}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => {e.stopPropagation(); confirmDeleteAction()}} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorkflowCard;