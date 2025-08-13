import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronUp, ChevronDown, AlignJustify, List, MessageSquare, MapPin, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const WorkflowHeader = ({
  isMobile,
  onAddNewCard,
  showArchived,
  isSummaryExpandedDesktop,
  setIsSummaryExpandedDesktop,
  cardViewMode,
  onToggleCardViewMode,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();

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
              variant="outline"
              onClick={() => navigate('/respostas-rapidas')}
              className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 dark:border-green-700 h-9"
            >
              <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
              RESPOSTAS
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/spot')}
              className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 dark:border-red-700 h-9"
            >
              <MapPin className="w-4 h-4 mr-2 text-red-600" />
              SPOT
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/gomov')}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700 h-9"
            >
              <Route className="w-4 h-4 mr-2 text-blue-600" />
              GO.MOV
            </Button>
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