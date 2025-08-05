import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { useModalState } from '@/contexts/ModalStateContext';
import { initialWorkflowColumnsData } from '@/lib/dataUtils';
import { parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import WorkflowHeader from '@/components/workflow/WorkflowHeader';
import WorkflowSummaryCards from '@/components/workflow/WorkflowSummaryCards';
import WorkflowFilters from '@/components/workflow/WorkflowFilters';
import WorkflowColumn from '@/components/workflow/WorkflowColumn';
import ArchivedWorkflowCardsView from '@/components/workflow/ArchivedWorkflowCardsView';
import WorkflowBottomBar from '@/components/workflow/WorkflowBottomBar';

const defaultColumnColors = [
  'bg-purple-300 dark:bg-purple-700', 'bg-blue-300 dark:bg-blue-700', 'bg-yellow-300 dark:bg-yellow-700', 
  'bg-pink-300 dark:bg-pink-700', 'bg-green-300 dark:bg-green-700', 'bg-rose-300 dark:bg-rose-700', 
  'bg-indigo-300 dark:bg-indigo-700', 'bg-teal-300 dark:bg-teal-700', 'bg-red-300 dark:bg-red-700', 
  'bg-sky-300 dark:bg-sky-700', 'bg-fuchsia-300 dark:bg-fuchsia-700', 'bg-cyan-300 dark:bg-cyan-700', 
  'bg-lime-300 dark:bg-lime-700', 'bg-amber-300 dark:bg-amber-700', 'bg-violet-300 dark:bg-violet-700',
  'bg-slate-200 dark:bg-slate-700' 
];

const Workflow = ({ isMobile }) => {
  const { 
    workflowCards, 
    updateWorkflowCard, 
    deleteWorkflowCard: deleteCardContext, 
    settings, 
    setSettings: saveSettingsToContext, 
    getClientById, 
    getServicePackageById, 
    financialData,
    refreshData,
  } = useData();
  const { toast } = useToast();
  const { openModal } = useModalState();
  const [columns, setColumns] = useState([]);
  const [enabled, setEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    eventType: '', period: '', packageId: '', financialStatus: '', tag: '',
  });
  const [showArchived, setShowArchived] = useState(false);
  const [showNewColumnInput, setShowNewColumnInput] = useState(false); 
  const [newColumnName, setNewColumnName] = useState("");
  const [isSummaryExpandedDesktop, setIsSummaryExpandedDesktop] = useState(true);
  const [cardViewMode, setCardViewMode] = useState(settings?.workflow_card_view_mode || 'detailed');
  
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  const handleToggleCardViewMode = (mode) => {
    setCardViewMode(mode);
    saveSettingsToContext({ workflow_card_view_mode: mode });
  };
  
  const activeWorkflowCards = useMemo(() => workflowCards.filter(card => !card.archived), [workflowCards]);
  const archivedWorkflowCardsList = useMemo(() => workflowCards.filter(card => card.archived), [workflowCards]);

  const filteredWorkflowCards = useMemo(() => {
    const cardsToFilter = showArchived ? archivedWorkflowCardsList : activeWorkflowCards;
    return cardsToFilter.filter(card => {
      const client = card.client_id ? getClientById(card.client_id) : null;
      const servicePackage = card.service_package_id ? getServicePackageById(card.service_package_id) : null;
      const lowerSearchTerm = searchTerm.toLowerCase();

      const matchesSearch = (
        (card.title && card.title.toLowerCase().includes(lowerSearchTerm)) ||
        (client && client.name && client.name.toLowerCase().includes(lowerSearchTerm)) ||
        (card.date && card.date.includes(searchTerm)) ||
        (servicePackage && servicePackage.name && servicePackage.name.toLowerCase().includes(lowerSearchTerm))
      );

      const matchesEventType = !activeFilters.eventType || (servicePackage && servicePackage.niche === activeFilters.eventType);
      
      const matchesPeriod = (() => {
        if (!activeFilters.period || !card.date) return true;
        const cardDate = new Date(card.date);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (activeFilters.period === 'next7days') {
          const next7days = new Date(today);
          next7days.setDate(today.getDate() + 7);
          return cardDate >= today && cardDate <= next7days;
        }
        if (activeFilters.period === 'next30days') {
          const next30days = new Date(today);
          next30days.setDate(today.getDate() + 30);
          return cardDate >= today && cardDate <= next30days;
        }
        return true;
      })();

      const matchesPackage = !activeFilters.packageId || card.service_package_id === activeFilters.packageId;
      
      const cardTransaction = financialData.transactions.find(t => t.workflow_id === card.id);
      const matchesFinancialStatus = (() => {
        if (!activeFilters.financialStatus) return true;
        if (activeFilters.financialStatus === 'paid') return cardTransaction && cardTransaction.status === 'PAGO';
        if (activeFilters.financialStatus === 'pending') return !cardTransaction || cardTransaction.status !== 'PAGO';
        return true;
      })();

      const matchesTag = !activeFilters.tag || (card.tags && card.tags.includes(activeFilters.tag));

      return matchesSearch && matchesEventType && matchesPeriod && matchesPackage && matchesFinancialStatus && matchesTag;
    });
  }, [activeWorkflowCards, archivedWorkflowCardsList, showArchived, searchTerm, activeFilters, getClientById, getServicePackageById, financialData.transactions]);

  const saveWorkflowColumnsToSettings = useCallback((newColumns) => {
    const columnsToSave = newColumns.map(({ id, title, color }) => ({ id, title, color }));
    saveSettingsToContext({ workflow_columns: columnsToSave });
  }, [saveSettingsToContext]);

  useEffect(() => {
    if (showArchived) { setColumns([]); return; }
    const storedColumns = settings?.workflow_columns;
    let currentColsSetup = (storedColumns && storedColumns.length > 0) ? storedColumns.map(col => ({ ...col, cards: [] })) : initialWorkflowColumnsData.map(col => ({...col, cards: []}));
    
    const leadColumnIndex = currentColsSetup.findIndex(col => col.id === 'novo-lead');
    if (leadColumnIndex === -1) {
        currentColsSetup.unshift({ id: 'novo-lead', title: 'Novos Leads', cards: [], color: 'bg-slate-200 dark:bg-slate-700' });
    }
    
    const populatedColumns = currentColsSetup.map(col => {
      let cardsForColumn = filteredWorkflowCards.filter(card => card.status === col.id && !card.archived);
      cardsForColumn.sort((a, b) => {
        if (col.id === 'agendado') {
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          try {
            return parseISO(a.date) - parseISO(b.date) || (a.time || "00:00").localeCompare(b.time || "00:00") || 0;
          } catch(e) {
            return 0;
          }
        }
        return (a.order || 0) - (b.order || 0);
      });
      return { ...col, cards: cardsForColumn };
    });
    setColumns(populatedColumns);

    if (!storedColumns || storedColumns.length === 0 || leadColumnIndex === -1) {
      saveWorkflowColumnsToSettings(currentColsSetup.map(c => ({ id: c.id, title: c.title, color: c.color })));
    }
  }, [settings?.workflow_columns, filteredWorkflowCards, showArchived, saveWorkflowColumnsToSettings]); 

  const handleToggleNewColumnInput = () => { setShowNewColumnInput(prev => !prev); if (!showNewColumnInput) setNewColumnName(""); };
  const handleAddColumn = () => {
    if (!newColumnName.trim()) { toast({ title: "Erro", description: "O nome da coluna não pode ser vazio.", variant: "destructive" }); return; }
    const newColumnId = newColumnName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    if (columns.some(col => col.id === newColumnId)) { toast({ title: "Erro", description: "Já existe uma coluna com este ID.", variant: "destructive" }); return; }
    const newColumn = { id: newColumnId, title: newColumnName, color: 'bg-slate-200 dark:bg-slate-700', cards: [] };
    const updatedColumns = [...columns, newColumn];
    setColumns(updatedColumns);
    saveWorkflowColumnsToSettings(updatedColumns);
    setNewColumnName(""); setShowNewColumnInput(false);
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId, type } = result;
    if (!destination || showArchived) return;

    if (type === 'COLUMN') {
      const newColumnOrder = Array.from(columns);
      const [removed] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, removed);
      setColumns(newColumnOrder);
      saveWorkflowColumnsToSettings(newColumnOrder);
      return;
    }

    if (type === 'CARD') {
      if (source.droppableId === destination.droppableId && source.index === destination.index) return;

      const sourceColumn = columns.find(col => col.id === source.droppableId);
      const destColumn = columns.find(col => col.id === destination.droppableId);
      const draggedCard = activeWorkflowCards.find(c => c.id === draggableId);

      if (!draggedCard || !sourceColumn || !destColumn) {
        toast({ title: "Erro ao Mover", description: "Não foi possível encontrar o card ou a coluna de destino.", variant: "destructive" });
        return;
      }

      const newStatus = destColumn.id;
      const newColumnsState = [...columns];

      const sourceColIndex = newColumnsState.findIndex(col => col.id === source.droppableId);
      const destColIndex = newColumnsState.findIndex(col => col.id === destination.droppableId);

      let sourceCards = Array.from(newColumnsState[sourceColIndex].cards || []);
      sourceCards.splice(source.index, 1);
      newColumnsState[sourceColIndex] = { ...newColumnsState[sourceColIndex], cards: sourceCards };

      let destCards;
      if (source.droppableId === destination.droppableId) {
        destCards = sourceCards;
      } else {
        destCards = Array.from(newColumnsState[destColIndex].cards || []);
      }

      const cardToInsert = { ...draggedCard, status: newStatus, order: destination.index };
      destCards.splice(destination.index, 0, cardToInsert);
      newColumnsState[destColIndex] = { ...newColumnsState[destColIndex], cards: destCards };

      const finalColumnsState = newColumnsState.map(col => ({
        ...col,
        cards: (col.cards || []).map((card, index) => ({ ...card, order: index, status: col.id }))
      }));

      setColumns(finalColumnsState);

      try {
        const updatePromises = finalColumnsState.flatMap(col =>
          (col.cards || []).map((card, index) => {
            const originalCard = activeWorkflowCards.find(c => c.id === card.id);
            if (originalCard && (originalCard.status !== col.id || originalCard.order !== index)) {
              return updateWorkflowCard(card.id, { status: col.id, order: index });
            }
            return null;
          }).filter(Boolean)
        );

        await Promise.all(updatePromises);
        await refreshData('workflow_cards');
      } catch (error) {
        toast({ title: "Erro ao mover projeto", description: error.message, variant: "destructive" });
        setColumns(columns);
      }
    }
  };

  const handleAddCardToColumn = (columnId) => openModal('workflow', { initialStatus: columnId });
  const handleEditCard = (card) => openModal('workflow', { cardId: card.id });
  const handleDeleteCard = async (cardId) => { try { await deleteCardContext(cardId); await refreshData('workflow_cards'); } catch (error) { toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" }); } };
  const handleArchiveCard = async (cardId, archiveStatus) => { try { await updateWorkflowCard(cardId, { archived: archiveStatus }); await refreshData('workflow_cards'); } catch (error) { toast({ title: "Erro ao arquivar/restaurar", description: error.message, variant: "destructive" }); } };
  const handleSaveColumnSettings = (id, name, color) => { const updatedColumns = columns.map(col => col.id === id ? { ...col, title: name, color: color || col.color } : col); setColumns(updatedColumns); saveWorkflowColumnsToSettings(updatedColumns); };

  if (!enabled) return null;

  return (
    <div className={`flex flex-col h-full ${isMobile ? 'pb-16' : ''}`}>
      <div className={`flex-shrink-0 space-y-4 sm:space-y-6 bg-background ${isMobile ? 'pb-2' : 'pb-4 sm:pb-6'}`}>
        <WorkflowHeader 
          isMobile={isMobile}
          onAddNewCard={() => handleAddCardToColumn('agendado')} 
          showArchived={showArchived} 
          isSummaryExpandedDesktop={isSummaryExpandedDesktop} 
          setIsSummaryExpandedDesktop={setIsSummaryExpandedDesktop}
          cardViewMode={cardViewMode}
          onToggleCardViewMode={handleToggleCardViewMode}
        />
        {!isMobile && !showArchived && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: isSummaryExpandedDesktop ? "auto" : 0, opacity: isSummaryExpandedDesktop ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <WorkflowSummaryCards cards={activeWorkflowCards} columns={columns} />
            <WorkflowFilters activeFilters={activeFilters} setActiveFilters={setActiveFilters} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </motion.div>
        )}
      </div>
      <div className="flex-grow overflow-x-auto overflow-y-hidden scrollbar-thin">
        {showArchived ? (
          <div className="p-1"><ArchivedWorkflowCardsView cards={filteredWorkflowCards} onDeleteCard={handleDeleteCard} onUnarchiveCard={(cardId) => handleArchiveCard(cardId, false)} onEditCard={handleEditCard} /></div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex space-x-4 p-1 workflow-columns-container min-h-[calc(100vh-400px)] sm:min-h-[calc(100vh-350px)]">
                  {columns.map((column, index) => (
                    <WorkflowColumn key={column.id || `col-key-${index}`} column={column} index={index} onAddCard={handleAddCardToColumn} onEditCard={handleEditCard} onDeleteCard={handleDeleteCard} onArchiveCard={(cardId) => handleArchiveCard(cardId, true)} onSaveColumnSettings={handleSaveColumnSettings} defaultColors={defaultColumnColors}
                      onDeleteColumn={(id) => { const col = columns.find(c => c.id === id); if (col?.cards?.length) { toast({ title: "Atenção", description: "Não é possível excluir colunas com projetos. Mova-os primeiro.", variant: "destructive" }); return; } const updated = columns.filter(c => c.id !== id); setColumns(updated); saveWorkflowColumnsToSettings(updated); }} 
                      cardViewMode={cardViewMode}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
      {!isMobile && (
        <WorkflowBottomBar showArchived={showArchived} onToggleArchived={() => setShowArchived(!showArchived)} archivedCount={archivedWorkflowCardsList.length} showNewColumnInput={showNewColumnInput} onToggleNewColumnInput={handleToggleNewColumnInput} newColumnName={newColumnName} onSetNewColumnName={setNewColumnName} onAddNewColumn={handleAddColumn} />
      )}
    </div>
  );
};

export default Workflow;