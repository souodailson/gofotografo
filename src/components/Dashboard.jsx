import React, {
  useState,
  useEffect,
  useMemo,
} from 'react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { motion } from 'framer-motion';
import { cloneDeep } from 'lodash';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardCard from '@/components/dashboard/DashboardCard';
import FullScreenLoader from '@/components/FullScreenLoader';
import {
  GripVertical,
  Settings,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  getInitialCardConfig,
  getDefaultLayout,
  getTabletLayout,
  getMobileLayout,
  getExtraSmallMobileLayout,
  getExtraExtraSmallMobileLayout,
} from '@/lib/dashboard/layoutConfig';
import { getGreeting } from '@/lib/dashboard/greetings';

const ResponsiveGridLayout = WidthProvider(Responsive);

const validateAndFixLayouts = (layouts, config) => {
  if (!layouts || typeof layouts !== 'object') return null;
  const fixedLayouts = {};
  const breakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];
  for (const bp of breakpoints) {
    if (Array.isArray(layouts[bp])) {
      fixedLayouts[bp] = layouts[bp]
        .map((item, index) => {
          if (!item || typeof item.i !== 'string') {
            console.error(
              `Layout item inválido no breakpoint ${bp} no índice ${index}: `,
              item,
            );
            return null;
          }
          const cardConfig = config[item.i];
          const defaultSize = cardConfig?.defaultSize || { w: 4, h: 2 };
          return {
            ...item,
            x:
              typeof item.x === 'number' && !isNaN(item.x)
                ? item.x
                : 0,
            y:
              typeof item.y === 'number' && !isNaN(item.y)
                ? item.y
                : 0,
            w:
              typeof item.w === 'number' && !isNaN(item.w)
                ? item.w
                : defaultSize.w,
            h:
              typeof item.h === 'number' && !isNaN(item.h)
                ? item.h
                : defaultSize.h,
          };
        })
        .filter(Boolean);
    }
  }
  return fixedLayouts;
};

const Dashboard = ({ setActiveTab }) => {
  const {
    settings,
    setSettings: saveSettingsToContext,
    loading: dataContextLoading,
    wallets,
  } = useData();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initialCardConfigMemo = useMemo(() => {
    return getInitialCardConfig(setActiveTab, wallets);
  }, [setActiveTab, wallets]);

  const [layouts, setLayouts] = useState({
    lg: [],
    md: [],
    sm: [],
    xs: [],
    xxs: [],
  });
  const [savedLayouts, setSavedLayouts] = useState({
    lg: [],
    md: [],
    sm: [],
    xs: [],
    xxs: [],
  });
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedLayoutsData = settings?.dashboard_layout;
    const fixedLayouts = validateAndFixLayouts(
      savedLayoutsData,
      initialCardConfigMemo,
    );
    if (
      fixedLayouts &&
      Object.keys(fixedLayouts).length > 0 &&
      Object.values(fixedLayouts).some((l) => l.length > 0)
    ) {
      setLayouts(fixedLayouts);
      setSavedLayouts(cloneDeep(fixedLayouts));
    } else {
      const defaultLgLayout = getDefaultLayout(initialCardConfigMemo);
      const defaultLayoutsObj = {
        lg: defaultLgLayout,
        md: getTabletLayout(
          defaultLgLayout,
          initialCardConfigMemo,
        ),
        sm: getMobileLayout(
          defaultLgLayout,
          initialCardConfigMemo,
        ),
        xs: getExtraSmallMobileLayout(
          defaultLgLayout,
          initialCardConfigMemo,
        ),
        xxs: getExtraExtraSmallMobileLayout(
          defaultLgLayout,
          initialCardConfigMemo,
        ),
      };
      const fixedDefaultLayouts = validateAndFixLayouts(
        defaultLayoutsObj,
        initialCardConfigMemo,
      );
      setLayouts(fixedDefaultLayouts);
      setSavedLayouts(cloneDeep(fixedDefaultLayouts));
    }
  }, [settings, initialCardConfigMemo]);

  const handleSaveLayout = async () => {
    setIsSaving(true);
    const fixedLayoutsToSave = validateAndFixLayouts(
      layouts,
      initialCardConfigMemo,
    );
    try {
      await saveSettingsToContext(
        { dashboard_layout: fixedLayoutsToSave },
        true,
      );
      setSavedLayouts(cloneDeep(fixedLayoutsToSave));
      setIsEditing(false);
      toast({
        title: 'Layout salvo!',
        description: 'Sua nova organização foi salva.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: `Não foi possível salvar o layout: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePersonalizeToggle = () => {
    if (!isEditing) {
      setSavedLayouts(cloneDeep(layouts));
      toast({
        title: 'Modo de edição ativado',
        description: 'Arraste e redimensione os cards.',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleCancelPersonalization = () => {
    setLayouts(savedLayouts);
    setIsEditing(false);
    toast({
      title: 'Edição cancelada',
      description: 'Suas alterações foram descartadas.',
    });
  };

  const onLayoutChange = (layout, newLayouts) => {
    if (isMounted && isEditing) {
      setLayouts(newLayouts);
    }
  };

  const onBreakpointChange = (newBreakpoint) => {
    setCurrentBreakpoint(newBreakpoint);
  };

  const handleResetLayout = () => {
    const defaultLgLayout = getDefaultLayout(initialCardConfigMemo);
    const defaultLayoutsObj = {
      lg: defaultLgLayout,
      md: getTabletLayout(
        defaultLgLayout,
        initialCardConfigMemo,
      ),
      sm: getMobileLayout(
        defaultLgLayout,
        initialCardConfigMemo,
      ),
      xs: getExtraSmallMobileLayout(
        defaultLgLayout,
        initialCardConfigMemo,
      ),
      xxs: getExtraExtraSmallMobileLayout(
        defaultLgLayout,
        initialCardConfigMemo,
      ),
    };
    const fixedDefaultLayouts = validateAndFixLayouts(
      defaultLayoutsObj,
      initialCardConfigMemo,
    );
    setLayouts(fixedDefaultLayouts);
    toast({
      title: 'Layout redefinido',
      description:
        "O layout voltou ao padrão. Clique em 'Concluir' para salvar.",
    });
  };

  const handleRemoveCard = (cardId) => {
    const newLayouts = { ...layouts };
    for (const breakpoint in newLayouts) {
      newLayouts[breakpoint] = (
        newLayouts[breakpoint] || []
      ).filter((item) => item.i !== cardId);
    }
    setLayouts(newLayouts);
  };

  const handleAddCard = (cardId) => {
    // Impede adicionar um card que já está visível
    const cardIsVisible = Object.values(layouts).some(
      (layout) => layout && layout.some((item) => item.i === cardId),
    );
    if (cardIsVisible) {
      toast({
        title: 'Card já visível',
        description: 'Este card já está no seu dashboard.',
        variant: 'destructive',
      });
      return;
    }
    // Recupera a configuração do card
    const cardConfig = initialCardConfigMemo[cardId];
    if (!cardConfig) return;
    // Função auxiliar para definir tamanho do card por breakpoint
    const getSizeForBreakpoint = (bp) => {
      let { w, h } =
        cardConfig.defaultSize || { w: 4, h: 2 };
      const type = cardConfig.type;
      const chartType = cardConfig.chartType;
      switch (bp) {
        case 'md':
          if (type === 'stat') {
            w = 5;
            h = 2;
          } else if (type === 'smallStat') {
            w = 2;
            h = 2;
          } else if (type === 'chart') {
            w = Math.min(10, w * 1.5);
          }
          break;
        case 'sm':
          if (type === 'stat' || type === 'smallStat') {
            w = 4;
            h = 2;
          } else if (type === 'chart') {
            h =
              chartType === 'list' ? 6 : 5;
            w = 4;
          } else if (
            type === 'reminders' ||
            type === 'goals_summary'
          ) {
            h = 6;
            w = 4;
          }
          break;
        case 'xs':
        case 'xxs':
          if (type === 'stat' || type === 'smallStat') {
            w = 2;
            h = 2;
          } else if (type === 'chart') {
            h =
              chartType === 'list'
                ? bp === 'xs'
                  ? 7
                  : 8
                : bp === 'xs'
                ? 5
                : 6;
            w = 2;
          } else if (
            type === 'reminders' ||
            type === 'goals_summary'
          ) {
            h = bp === 'xs' ? 7 : 8;
            w = 2;
          }
          break;
        default:
          break;
      }
      return { w, h };
    };
    const newLayouts = { ...layouts };
    ['lg', 'md', 'sm', 'xs', 'xxs'].forEach((bp) => {
      const currentLayout = newLayouts[bp]
        ? [...newLayouts[bp]]
        : [];
      let y = 0;
      currentLayout.forEach((item) => {
        const bottom =
          (item.y || 0) + (item.h || 1);
        if (bottom > y) y = bottom;
      });
      const { w, h } = getSizeForBreakpoint(bp);
      currentLayout.push({ i: cardId, x: 0, y, w, h });
      newLayouts[bp] = currentLayout;
    });
    setLayouts(newLayouts);
  };

  const handleToggleBalances = async () => {
    const newShowBalances =
      !(settings?.hide_dashboard_balances !== false);
    await saveSettingsToContext(
      { hide_dashboard_balances: !newShowBalances },
      true,
    );
  };

  if (
    dataContextLoading ||
    !isMounted ||
    !layouts ||
    Object.keys(layouts).length === 0
  ) {
    return <FullScreenLoader />;
  }

  const currentLayout =
    layouts[currentBreakpoint] ||
    layouts.lg ||
    [];
  const visibleCards = new Set(
    currentLayout.map((item) => item.i),
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardHeader
        greeting={getGreeting(settings?.user_name)}
        isPersonalizing={isEditing}
        isSaving={isSaving}
        onPersonalizeToggle={handlePersonalizeToggle}
        onSave={handleSaveLayout}
        onCancel={handleCancelPersonalization}
        onAddCard={handleAddCard}
        initialCardConfigMemo={initialCardConfigMemo}
        visibleCards={Array.from(visibleCards)}
        onResetLayout={handleResetLayout}
        onToggleBalances={handleToggleBalances}
        showBalances={
          settings?.hide_dashboard_balances === false
        }
        showGreetings={settings?.show_greetings}
      />

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{
          lg: 1200,
          md: 996,
          sm: 768,
          xs: 480,
          xxs: 0,
        }}
        cols={{
          lg: 12,
          md: 10,
          sm: 4,
          xs: 2,
          xxs: 2,
        }}
        rowHeight={50}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        onLayoutChange={onLayoutChange}
        onBreakpointChange={onBreakpointChange}
        isDraggable={isEditing}
        isResizable={isEditing}
        draggableHandle=".drag-handle"
        preventCollision={false}
        compactType="vertical"
      >
        {currentLayout.map((item) => {
          if (
            !item ||
            !initialCardConfigMemo[item.i]
          )
            return null;
          return (
            <div
              key={item.i}
              className="relative group dashboard-card"
            >
              {isEditing && (
                <>
                  <div className="drag-handle absolute top-2 left-2 p-1.5 bg-card/80 rounded-full cursor-grab active:cursor-grabbing z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical size={16} />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Settings size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() =>
                          handleRemoveCard(item.i)
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover Card
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              <div className="flex-grow h-full w-full">
                <DashboardCard
                  cardId={item.i}
                  layout={item}
                  isEditing={isEditing}
                  setActiveTab={setActiveTab}
                />
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};

export default Dashboard;
