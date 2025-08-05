import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronUp, ChevronDown, AlignJustify, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WorkflowHeader = ({
  isMobile,
  onAddNewCard,
  showArchived,
  isSummaryExpandedDesktop,
  setIsSummaryExpandedDesktop,
  cardViewMode,
  onToggleCardViewMode,
}) => {

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-left flex-grow"
      >
        <h1 className="text-2xl sm:text-3xl titulo-gradiente">Fluxo de Trabalho</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">Gerencie seus projetos e acompanhe o progresso</p>
      </motion.div>

      <div className={`flex ${isMobile ? 'hidden' : 'items-center space-x-2 flex-shrink-0'}`}>
        {!isMobile && !showArchived && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={onAddNewCard}
              size="default"
              className="btn-custom-gradient text-white shadow-lg h-9"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Trabalho
            </Button>
            <div className="flex items-center rounded-md bg-muted p-0.5">
              <Button
                variant={cardViewMode === 'summarized' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-2"
                onClick={() => onToggleCardViewMode('summarized')}
              >
                <List className="w-4 h-4" />
                <span className="sr-only">Resumido</span>
              </Button>
              <Button
                variant={cardViewMode === 'detailed' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-2"
                onClick={() => onToggleCardViewMode('detailed')}
              >
                <AlignJustify className="w-4 h-4" />
                <span className="sr-only">Detalhado</span>
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSummaryExpandedDesktop(!isSummaryExpandedDesktop)}
              className="text-muted-foreground hover:bg-accent h-9"
              title={isSummaryExpandedDesktop ? "Ocultar Resumo" : "Mostrar Resumo"}
            >
              {isSummaryExpandedDesktop ? <ChevronUp className="w-4 h-4 mr-1 sm:mr-2" /> : <ChevronDown className="w-4 h-4 mr-1 sm:mr-2" />}
              <span className="hidden sm:inline">{isSummaryExpandedDesktop ? "Ocultar" : "Mostrar"} Resumo</span>
              <span className="sm:hidden">{isSummaryExpandedDesktop ? "Ocultar" : "Mostrar"}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowHeader;