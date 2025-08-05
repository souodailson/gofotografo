import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArchiveRestore, Trash2, Edit, User, Tag, Calendar, DollarSign, Info, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useData } from '@/contexts/DataContext';

const ArchivedCard = ({ card, onUnarchive, onDelete, onEdit }) => {
  const { getClientById, getServicePackageById } = useData();
  const client = card.client_id ? getClientById(card.client_id) : null;
  const servicePackage = card.service_package_id ? getServicePackageById(card.service_package_id) : null;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const confirmDelete = () => {
    onDelete(card.id);
    setShowDeleteConfirm(false);
  };
  
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


  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-600"
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 break-all">{card.title || (client ? client.name : 'Card Arquivado')}</h3>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200" onClick={() => onEdit(card)}>
              <Edit size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="w-7 h-7 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" onClick={() => onUnarchive(card.id)}>
              <ArchiveRestore size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="w-7 h-7 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        {client && <p className="text-xs text-slate-600 dark:text-slate-300 mb-1 flex items-center"><User size={12} className="mr-1" /> {client.name}</p>}
        {servicePackage && <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Pacote: {servicePackage.name}</p>}
        {card.date && <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center"><Calendar size={12} className="mr-1" /> {new Date(card.date).toLocaleDateString('pt-BR')}</p>}
        {card.value > 0 && <p className="text-xs text-green-600 dark:text-green-400 mb-1 flex items-center"><DollarSign size={12} className="mr-1" /> R$ {Number(card.value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {card.tags.map((tag, index) => (
              <span key={index} className={`text-xs px-1.5 py-0.5 rounded-full ${getTagColor(tag)} flex items-center`}>
                <Tag size={10} className="mr-1" />{tag}
              </span>
            ))}
          </div>
        )}
         {card.history && card.history.length > 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Arquivado em: {new Date(card.history.find(h => h.action === "Card arquivado")?.date || card.updated_at || card.created_at).toLocaleDateString('pt-BR')}
          </p>
        )}
      </motion.div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Card Permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O card "{card.title || 'este card'}" será excluído para sempre.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};


const ArchivedWorkflowCardsView = ({ cards, onDeleteCard, onUnarchiveCard, onEditCard }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 dark:text-slate-400">
        <Archive size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-500" />
        <h3 className="text-xl font-semibold">Nenhum card arquivado</h3>
        <p>Você ainda não arquivou nenhum card.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Cards Arquivados ({cards.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.sort((a,b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)).map(card => (
          <ArchivedCard 
            key={card.id} 
            card={card} 
            onUnarchive={onUnarchiveCard} 
            onDelete={onDeleteCard}
            onEdit={onEditCard}
          />
        ))}
      </div>
    </div>
  );
};

export default ArchivedWorkflowCardsView;