import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Plus, Loader2, Trash2, GripVertical, StickyNote, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NoteWidget from './widgets/NoteWidget';
import TodoListWidget from './widgets/TodoListWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

const BoardCanvasView = ({ board }) => {
  const { user } = useData();
  const { toast } = useToast();
  const [widgets, setWidgets] = useState([]);
  const [layouts, setLayouts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const fetchWidgets = useCallback(async () => {
    if (!user || !board?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('board_widgets')
        .select('*')
        .eq('board_id', board.id);
      if (error) throw error;
      setWidgets(data);
      
      const newLayouts = {};
      data.forEach(w => {
        if (w.layout) {
          const safeLayout = {
            i: w.id.toString(),
            x: w.layout.x ?? 0,
            y: w.layout.y ?? Infinity,
            w: w.layout.w ?? 4,
            h: w.layout.h ?? 4
          };
          if (!newLayouts.lg) newLayouts.lg = [];
          newLayouts.lg.push(safeLayout);
        }
      });
      setLayouts(newLayouts);

    } catch (error) {
      toast({ title: 'Erro ao carregar anotações', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
      setTimeout(() => setIsMounted(true), 100);
    }
  }, [board?.id, user, toast]);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  const onLayoutChange = async (layout) => {
    if (!isMounted || !widgets.length) return;

    const updates = layout.map(item => {
      const { i, x, y, w, h } = item;
      return supabase.from('board_widgets').update({ layout: { x, y, w, h } }).eq('id', i);
    });
    
    try {
      await Promise.all(updates);
    } catch (error) {
      toast({ title: 'Erro ao salvar layout', description: error.message, variant: 'destructive' });
    }
  };

  const addWidget = async (type) => {
    try {
      const newWidget = {
        board_id: board.id,
        user_id: user.id,
        type: type,
        content: type === 'todo_list' ? { items: [] } : { text: '' },
        layout: { x: 0, y: Infinity, w: 4, h: type === 'todo_list' ? 6 : 4 }
      };
      const { data, error } = await supabase.from('board_widgets').insert(newWidget).select().single();
      if (error) throw error;
      
      setWidgets(prev => [...prev, data]);
      toast({ title: 'Widget adicionado!' });
    } catch (error) {
      toast({ title: 'Erro ao adicionar widget', description: error.message, variant: 'destructive' });
    }
  };

  const deleteWidget = async (widgetId) => {
    try {
      const { error } = await supabase.from('board_widgets').delete().eq('id', widgetId);
      if (error) throw error;
      
      setWidgets(prev => prev.filter(w => w.id !== widgetId));
      toast({ title: 'Widget removido!' });
    } catch (error) {
      toast({ title: 'Erro ao remover widget', description: error.message, variant: 'destructive' });
    }
  };

  const updateWidgetContent = async (widgetId, newContent) => {
    setWidgets(prev => prev.map(w => w.id === widgetId ? { ...w, content: newContent } : w));
    try {
      const { error } = await supabase.from('board_widgets').update({ content: newContent }).eq('id', widgetId);
      if (error) throw error;
    } catch (error) {
      toast({ title: 'Erro ao salvar anotação', description: error.message, variant: 'destructive' });
      fetchWidgets();
    }
  };

  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'note':
        return <NoteWidget content={widget.content} onContentChange={(newContent) => updateWidgetContent(widget.id, newContent)} />;
      case 'todo_list':
        return <TodoListWidget content={widget.content} onContentChange={(newContent) => updateWidgetContent(widget.id, newContent)} />;
      default:
        return <div>Widget desconhecido</div>;
    }
  };
  
  const generatedLayouts = {
    lg: widgets.map(w => ({
      i: w.id.toString(),
      x: w.layout?.x ?? 0,
      y: w.layout?.y ?? Infinity,
      w: w.layout?.w ?? 4,
      h: w.layout?.h ?? 4,
    }))
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Widget
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => addWidget('note')}>
              <StickyNote className="w-4 h-4 mr-2" /> Anotação Rápida
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addWidget('todo_list')}>
              <ListTodo className="w-4 h-4 mr-2" /> Lista de Tarefas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-grow overflow-auto relative">
        {isMounted && (
          <ResponsiveGridLayout
            className="layout"
            layouts={generatedLayouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            onLayoutChange={onLayoutChange}
            isDraggable={true}
            isResizable={true}
            draggableHandle=".drag-handle"
            compactType="vertical"
          >
            {widgets.map(widget => (
              <div key={widget.id} className="relative group bg-card rounded-lg shadow-md border border-border overflow-hidden">
                <div className="drag-handle absolute top-1 left-1 p-1.5 bg-card/50 rounded-full cursor-grab active:cursor-grabbing z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={16} />
                </div>
                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 z-20 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteWidget(widget.id)}>
                  <Trash2 size={16} className="text-destructive" />
                </Button>
                <div className="w-full h-full pt-8">
                  {renderWidget(widget)}
                </div>
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </div>
    </div>
  );
};

export default BoardCanvasView;