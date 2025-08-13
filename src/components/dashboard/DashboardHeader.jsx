import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings, Check, X, Plus, RotateCcw, Eye, EyeOff, Target, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import useMobileLayout from '@/hooks/useMobileLayout';

const DashboardHeader = ({ 
  greeting, 
  isPersonalizing, 
  isSaving,
  onPersonalizeToggle, 
  onSave, 
  onCancel,
  onAddCard,
  initialCardConfigMemo,
  visibleCards,
  onResetLayout,
  onToggleBalances,
  showBalances,
  showGreetings
}) => {
  const availableCardsToAdd = Object.keys(initialCardConfigMemo).filter(key => !visibleCards.includes(key));
  const { isMobile } = useMobileLayout();
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <div className="dashboard-header-container flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-greeting-container mb-4 sm:mb-0"
      >
        <h1 className={cn(
          "text-2xl md:text-3xl font-bold text-foreground",
          showGreetings && "titulo-gradiente-animado"
        )}>
          {greeting}
        </h1>
        <p className="text-muted-foreground dashboard-subtitle">Aqui está um resumo do seu negócio hoje.</p>
      </motion.div>
      <div className="dashboard-controls-container flex items-center space-x-2">
        {!isMobile && (
          <>
            <Button
              variant="outline"
              onClick={() => navigate('/rival')}
              className="bg-transparent border-[#dbddd5] text-muted-foreground hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 hover:border-orange-200 hover:text-orange-600 dark:border-[#dbddd5] dark:hover:from-orange-900/20 dark:hover:to-red-900/20 dark:hover:border-orange-700 transition-all duration-300"
            >
              <Target className="w-4 h-4 mr-2 text-current" />
              RIVAL
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/metas')}
              className="bg-transparent border-[#dbddd5] text-muted-foreground hover:bg-gradient-to-r hover:from-yellow-100 hover:to-amber-100 hover:border-yellow-200 hover:text-yellow-600 dark:border-[#dbddd5] dark:hover:from-yellow-900/20 dark:hover:to-amber-900/20 dark:hover:border-yellow-700 transition-all duration-300"
            >
              <Trophy className="w-4 h-4 mr-2 text-current" />
              METAS
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onToggleBalances}>
                    {showBalances ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showBalances ? 'Ocultar saldos' : 'Mostrar saldos'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}

        {isPersonalizing ? (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Card
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {availableCardsToAdd.length > 0 ? (
                  availableCardsToAdd.map(cardId => (
                    <DropdownMenuItem key={cardId} onClick={() => onAddCard(cardId)}>
                      {initialCardConfigMemo[cardId].title}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>Todos os cards visíveis</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={onResetLayout}>
              <RotateCcw className="w-4 h-4 mr-2" /> Redefinir
            </Button>
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button onClick={onSave} disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white">
              <Check className="w-4 h-4 mr-2" /> {isSaving ? 'Salvando...' : 'Concluir'}
            </Button>
          </motion.div>
        ) : (
          !isMobile && (
            <Button variant="outline" onClick={onPersonalizeToggle} className="dashboard-personalize-button">
              <Settings className="w-4 h-4 mr-2" /> Personalizar
            </Button>
          )
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;