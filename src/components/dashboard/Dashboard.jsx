import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { motion } from 'framer-motion';
import { getGreeting } from '@/lib/dashboard/greetings';
import { defaultLayouts, componentMap } from '@/lib/dashboard/layoutConfig';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DraggableDashboardCard from '@/components/dashboard/dnd/DraggableDashboardCard';
import { useModalState } from '@/contexts/ModalStateContext';

const ResponsiveGridLayout = WidthProvider(Responsive);

const Dashboard = ({ setActiveTab, isMobile }) => {
  const { settings, setSettings, loading, workflowCards, financialData, clients, servicePackages, savingGoals } = useData();
  const { toast } = useToast();
  const { openModal } = useModalState();
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState(settings?.dashboard_layout || defaultLayouts);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (settings && settings.dashboard_layout) {
      const validatedLayouts = {};
      Object.keys(settings.dashboard_layout).forEach(breakpoint => {
        validatedLayouts[breakpoint] = settings.dashboard_layout[breakpoint].map(item => ({
          ...item,
          x: typeof item.x === 'number' ? item.x : 0,
          y: typeof item.y === 'number' ? item.y : 0,
          w: typeof item.w === 'number' ? item.w : 1,
          h: typeof item.h === 'number' ? item.h : 1,
        }));
      });
      setLayouts(validatedLayouts);
    } else {
      setLayouts(defaultLayouts);
    }
  }, [settings]);

  const onLayoutChange = useCallback((layout, newLayouts) => {
    if (mounted && isEditMode) {
      setLayouts(newLayouts);
    }
  }, [mounted, isEditMode]);

  const handleSaveLayout = async () => {
    try {
      await setSettings({ dashboard_layout: layouts });
      toast({ title: "Layout Salvo!", description: "Seu novo layout do dashboard foi salvo com sucesso." });
      setIsEditMode(false);
    } catch (error) {
      toast({ title: "Erro ao Salvar", description: `Não foi possível salvar o layout: ${error.message}`, variant: "destructive" });
    }
  };

  const handleResetLayout = async () => {
    try {
      await setSettings({ dashboard_layout: defaultLayouts });
      setLayouts(defaultLayouts);
      toast({ title: "Layout Restaurado!", description: "O layout do dashboard foi restaurado para o padrão." });
    } catch (error) {
      toast({ title: "Erro ao Restaurar", description: `Não foi possível restaurar o layout: ${error.message}`, variant: "destructive" });
    }
  };

  const handleToggleCardVisibility = (cardId) => {
    const newLayouts = JSON.parse(JSON.stringify(layouts));
    let itemFound = false;
    for (const breakpoint in newLayouts) {
      const itemIndex = newLayouts[breakpoint].findIndex(item => item.i === cardId);
      if (itemIndex !== -1) {
        newLayouts[breakpoint][itemIndex].static = !newLayouts[breakpoint][itemIndex].static;
        itemFound = true;
      }
    }
    if (itemFound) {
      setLayouts(newLayouts);
      toast({ title: "Visibilidade do Card Alterada", description: "Salve o layout para aplicar as mudanças." });
    }
  };

  const greeting = getGreeting();

  const visibleCards = Object.keys(componentMap).filter(key => {
    const layoutItem = layouts.lg?.find(item => item.i === key);
    return layoutItem && !layoutItem.static;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <DashboardHeader
        greeting={greeting}
        userName={settings?.user_name || 'Usuário'}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onSaveLayout={handleSaveLayout}
        onResetLayout={handleResetLayout}
        onAddCard={() => openModal('addDashboardCard')}
        isMobile={isMobile}
      />

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={onLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        draggableHandle=".drag-handle"
      >
        {visibleCards.map(key => (
          <div key={key}>
            <DraggableDashboardCard
              cardId={key}
              isEditMode={isEditMode}
              onHideCard={() => handleToggleCardVisibility(key)}
            >
              {React.createElement(componentMap[key].component, {
                ...componentMap[key].props,
                setActiveTab,
                isMobile,
                loading,
                workflowCards,
                financialData,
                clients,
                servicePackages,
                savingGoals,
                openModal,
              })}
            </DraggableDashboardCard>
          </div>
        ))}
      </ResponsiveGridLayout>
    </motion.div>
  );
};

export default Dashboard;