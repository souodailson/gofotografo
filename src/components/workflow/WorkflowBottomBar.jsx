import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ListChecks, CalendarDays, Archive, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";

const WorkflowBottomBar = ({
  viewMode,
  onToggleViewMode,
  showArchived,
  onToggleArchived,
  archivedCount,
  showNewColumnInput,
  onToggleNewColumnInput,
  newColumnName,
  onSetNewColumnName,
  onAddNewColumn,
}) => {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="fixed bottom-0 left-0 right-0 bg-card/80 dark:bg-card/70 backdrop-blur-lg border-t border-border p-2 shadow-top-lg z-40 md:hidden"
    >
      <div className="flex items-center justify-around space-x-1">
        <Button 
          onClick={onToggleArchived} 
          variant="ghost" 
          size="sm" 
          className="flex-1 flex flex-col items-center h-auto py-1.5 text-xs text-muted-foreground hover:text-foreground"
          title={showArchived ? 'Ocultar Arquivados' : `Ver Arquivados (${archivedCount})`}
        >
          {showArchived ? <EyeOff className="w-5 h-5 mb-0.5" /> : <Archive className="w-5 h-5 mb-0.5" />}
          <span className="truncate">{showArchived ? 'Visíveis' : `Arquivos (${archivedCount})`}</span>
        </Button>
        
        <Button 
          onClick={onToggleViewMode} 
          variant="ghost" 
          size="sm" 
          className="flex-1 flex flex-col items-center h-auto py-1.5 text-xs text-muted-foreground hover:text-foreground"
          title={viewMode === 'kanban' ? 'Visualizar Timeline' : 'Visualizar Kanban'}
          disabled={showArchived}
        >
          {viewMode === 'kanban' ? <CalendarDays className="w-5 h-5 mb-0.5" /> : <ListChecks className="w-5 h-5 mb-0.5" />}
          <span className="truncate">{viewMode === 'kanban' ? 'Timeline' : 'Kanban'}</span>
        </Button>
        
        {!showNewColumnInput && !showArchived && (
          <Button 
            onClick={onToggleNewColumnInput}
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center h-auto py-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Adicionar Nova Coluna"
          >
            <Plus className="w-5 h-5 mb-0.5" />
            <span className="truncate">Nova Coluna</span>
          </Button>
        )}
      </div>
      {showNewColumnInput && !showArchived && (
        <motion.div 
          initial={{height: 0, opacity: 0, marginTop: 0}} 
          animate={{height: "auto", opacity: 1, marginTop: "0.5rem"}} 
          exit={{height: 0, opacity: 0, marginTop: 0}}
          className="flex flex-col space-y-2 p-2 bg-background rounded-md shadow-inner"
        >
          <Input 
            type="text" 
            value={newColumnName} 
            onChange={(e) => onSetNewColumnName(e.target.value)} 
            placeholder="Nome da nova coluna"
            className="w-full h-9 text-sm"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && onAddNewColumn()}
          />
          <div className="flex w-full space-x-2">
              <Button onClick={onAddNewColumn} size="sm" className="flex-1 h-9 text-xs">Salvar Coluna</Button>
              <Button onClick={onToggleNewColumnInput} variant="outline" size="sm" className="flex-1 h-9 text-xs">Cancelar</Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WorkflowBottomBar;