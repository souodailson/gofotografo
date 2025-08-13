import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { cloneDeep } from 'lodash';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

import BoardsHeader from './BoardsHeader';
import AddBoardModal from './modals/AddBoardModal';
import DeleteWidgetDialog from './modals/DeleteWidgetDialog';
import WidgetRenderer from './WidgetRenderer';
import './boards.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const defaultBoardBackground = "https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//fundo%20liquid%20gofotografo%20wihtout%20grain.jpg";

const findNextAvailablePosition = (layouts) => {
    const lgLayout = layouts.lg || [];
    if (!lgLayout.length) return { x: 0, y: 0 };
    const occupied = new Set();
    const COLS = 12;
    lgLayout.forEach(item => {
        for (let y = item.y; y < item.y + item.h; y++) {
            for (let x = item.x; x < item.x + item.w; x++) {
                occupied.add(`${x},${y}`);
            }
        }
    });
    let y = 0;
    while (true) {
        for (let x = 0; x <= COLS - 4; x++) {
            if (!occupied.has(`${x},${y}`)) return { x, y };
        }
        y++;
    }
};

const Boards = ({ setSidebarCollapsed }) => {
  const { user } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState([]);
  const [layouts, setLayouts] = useState({});
  const [savedLayouts, setSavedLayouts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState(null);
  const [autoFocusWidgetId, setAutoFocusWidgetId] = useState(null);

  useEffect(() => {
    if (setSidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);
  
  const fetchWidgets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mesa_widgets')
        .select('*, quadro:quadros(id, nome_quadro, imagem_fundo)')
        .eq('user_id', user.id);
      if (error) throw error;

      const fetchedWidgets = data || [];
      setWidgets(fetchedWidgets);
      
      const newLayouts = { lg: fetchedWidgets.map(w => ({
          i: w.id.toString(),
          ...(w.posicao || { x: 0, y: Infinity, w: 4, h: 4 })
      }))};
      setLayouts(newLayouts);
      setSavedLayouts(cloneDeep(newLayouts));

    } catch (error) {
      toast({ title: 'Erro ao buscar widgets', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
      setTimeout(() => setIsMounted(true), 100);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
        fetchWidgets();
    }
  }, [user, fetchWidgets]);

  const handleEditToggle = () => {
    if (!isEditing) {
      setSavedLayouts(cloneDeep(layouts));
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setLayouts(savedLayouts);
    setIsEditing(false);
  };

  const handleSaveLayout = async () => {
    setIsSaving(true);
    const currentLgLayout = layouts.lg || [];
    const updates = currentLgLayout.map(item => {
      const { i, x, y, w, h } = item;
      return supabase
        .from('mesa_widgets')
        .update({ posicao: { x, y, w, h } })
        .eq('id', i);
    }).filter(Boolean);

    try {
      await Promise.all(updates);
      setSavedLayouts(cloneDeep(layouts));
      setIsEditing(false);
      toast({ title: 'Layout Salvo!', description: 'Sua mesa de trabalho foi atualizada.' });
    } catch (error) {
      toast({ title: 'Erro ao salvar layout', description: error.message, variant: 'destructive' });
      setLayouts(savedLayouts);
    } finally {
      setIsSaving(false);
    }
  };

  const onLayoutChange = (layout, allLayouts) => {
    if (isMounted && isEditing) {
      setLayouts(allLayouts);
    }
  };
  
  const handleAddWidget = async (type) => {
    try {
      const nextPos = findNextAvailablePosition(layouts);
      let newWidgetData = {
        user_id: user.id,
        tipo_widget: type,
        posicao: { x: nextPos.x, y: nextPos.y, w: 4, h: 4 },
        conteudo: {},
      };

      if (type === 'nota') {
        newWidgetData.conteudo = { text: '' };
        newWidgetData.posicao.h = 4;
      } else if (type === 'lista_tarefas') {
        newWidgetData.conteudo = { title: 'Nova lista', items: [] };
        newWidgetData.posicao.h = 6;
      }

      const { data: insertedWidget, error } = await supabase
        .from('mesa_widgets').insert(newWidgetData).select('*, quadro:quadros(id, nome_quadro, imagem_fundo)').single();
      if (error) throw error;
      
      setWidgets(prev => [...prev, insertedWidget]);
      setLayouts(prev => ({ ...prev, lg: [...(prev.lg || []), { i: insertedWidget.id.toString(), ...newWidgetData.posicao }] }));
      setAutoFocusWidgetId(insertedWidget.id);
      toast({ title: 'Widget adicionado!' });
    } catch (error) {
      toast({ title: 'Erro ao adicionar widget', description: error.message, variant: 'destructive' });
    }
  };

  const handleCreateBoardAndWidget = async (newBoardName, templateColumns = []) => {
    try {
      const { data: newBoard, error: boardError } = await supabase
        .from('quadros').insert({ nome_quadro: newBoardName, user_id: user.id, imagem_fundo: defaultBoardBackground }).select().single();
      if (boardError) throw boardError;

      if (templateColumns.length > 0) {
        const columnsToInsert = templateColumns.map((title, index) => ({
          quadro_id: newBoard.id,
          user_id: user.id,
          titulo_coluna: title,
          ordem: index,
        }));
        const { error: columnsError } = await supabase.from('quadro_colunas').insert(columnsToInsert);
        if (columnsError) throw columnsError;
      }
      
      const nextPos = findNextAvailablePosition(layouts);
      const widgetData = {
        user_id: user.id,
        tipo_widget: 'link_quadro',
        link_quadro_id: newBoard.id,
        posicao: { x: nextPos.x, y: nextPos.y, w: 4, h: 3 },
        conteudo: { nome_quadro: newBoard.nome_quadro }
      };

      const { data: newWidget, error: widgetError } = await supabase
        .from('mesa_widgets').insert(widgetData).select('*, quadro:quadros(id, nome_quadro, imagem_fundo)').single();
      if (widgetError) throw widgetError;
      
      setWidgets(prev => [...prev, newWidget]);
      setLayouts(prev => ({ ...prev, lg: [...(prev.lg || []), { i: newWidget.id.toString(), ...widgetData.posicao }] }));
      toast({ title: 'Sucesso!', description: `Quadro "${newBoardName}" criado.` });
      navigate(`/quadros/${newBoard.id}`);
    } catch (error) {
      toast({ title: 'Erro ao criar quadro', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const handleDeleteWidget = async () => {
    if (!widgetToDelete) return;
    try {
      await supabase.from('mesa_widgets').delete().eq('id', widgetToDelete.id);
      setWidgets(prev => prev.filter(w => w.id !== widgetToDelete.id));
      setLayouts(prev => ({...prev, lg: prev.lg.filter(l => l.i !== widgetToDelete.id.toString())}));
      if (widgetToDelete.tipo_widget === 'link_quadro' && widgetToDelete.link_quadro_id) {
           await supabase.from('quadros').delete().eq('id', widgetToDelete.link_quadro_id);
           toast({ title: 'Quadro e atalho removidos!' });
      } else {
           toast({ title: 'Widget removido!' });
      }
    } catch (error) {
        toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
    } finally {
      setWidgetToDelete(null);
    }
  };

  useEffect(() => {
    if (autoFocusWidgetId) {
      const timer = setTimeout(() => setAutoFocusWidgetId(null), 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocusWidgetId]);

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <BoardsHeader
        isEditing={isEditing}
        isSaving={isSaving}
        onEditToggle={handleEditToggle}
        onSave={handleSaveLayout}
        onCancel={handleCancelEdit}
        onAddWidget={handleAddWidget}
        onAddBoard={() => setIsModalOpen(true)}
      />

      <div className={cn("flex-grow overflow-auto relative boards-container", isEditing && "modo-edicao-ativo")}>
        {loading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
        ) : isMounted ? (
          <ResponsiveGridLayout
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            onLayoutChange={onLayoutChange}
            isDraggable={isEditing}
            isResizable={isEditing}
            draggableHandle=".drag-handle"
            compactType="vertical"
            margin={[16, 16]}
            containerPadding={[16, 16]}
            useCSSTransforms={true}
            transformScale={1}
            draggableCancel=".no-drag"
            resizeHandle={isEditing ? undefined : <span className="react-resizable-handle hidden"></span>}
            style={{ transition: 'all 0.3s ease-in-out' }}
          >
            {widgets.map(widget => (
              <div 
                key={widget.id} 
                className={cn(
                  "group transition-all duration-300 ease-in-out",
                  isEditing ? 
                    "hover:scale-105 hover:z-20 hover:shadow-2xl hover:shadow-blue-500/20" : 
                    "hover:scale-103 hover:z-10 hover:shadow-lg"
                )}
              >
                <WidgetRenderer
                  widget={widget}
                  isEditing={isEditing}
                  autoFocus={widget.id === autoFocusWidgetId}
                  onDelete={() => setWidgetToDelete(widget)}
                  fetchWidgets={fetchWidgets}
                />
              </div>
            ))}
          </ResponsiveGridLayout>
        ) : null}
      </div>

      <AddBoardModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCreate={handleCreateBoardAndWidget}
      />
      
      <DeleteWidgetDialog
        widget={widgetToDelete}
        onOpenChange={() => setWidgetToDelete(null)}
        onConfirm={handleDeleteWidget}
      />
    </div>
  );
};

export default Boards;