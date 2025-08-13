import React, { useMemo, memo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { GripVertical, X } from 'lucide-react';
import NoteWidget from './widgets/NoteWidget';
import TodoListWidget from './widgets/TodoListWidget';
import BoardLinkWidget from './widgets/BoardLinkWidget';

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const WidgetRenderer = ({ widget, isEditing, autoFocus, onDelete, fetchWidgets }) => {
  const { toast } = useToast();

  const debouncedUpdateWidgetContent = useMemo(() => 
    debounce(async (widgetId, newContent) => {
      try {
        const { error } = await supabase.from('mesa_widgets').update({ conteudo: newContent }).eq('id', widgetId);
        if (error) throw error;
      } catch (error) {
        toast({ title: 'Erro ao salvar widget', description: error.message, variant: 'destructive' });
        if (fetchWidgets) fetchWidgets();
      }
    }, 1000),
  [toast, fetchWidgets]);

  const updateWidgetContent = (widgetId, newContent) => {
    debouncedUpdateWidgetContent(widgetId, newContent);
  };


  const renderSpecificWidget = () => {
    switch (widget.tipo_widget) {
      case 'nota':
        return <NoteWidget content={widget.conteudo} onContentChange={(c) => updateWidgetContent(widget.id, c)} autoFocus={autoFocus} />;
      case 'lista_tarefas':
        return <TodoListWidget content={widget.conteudo} onContentChange={(c) => updateWidgetContent(widget.id, c)} autoFocus={autoFocus} />;
      case 'link_quadro':
        return <BoardLinkWidget widget={widget} />;
      default:
        return <div>Widget desconhecido</div>;
    }
  };

  const isGlassmorphism = widget.tipo_widget === 'nota' || widget.tipo_widget === 'lista_tarefas';

  return (
    <div className="h-full w-full relative group">
      {isEditing && (
        <>
          <button 
            onClick={onDelete}
            className="absolute -top-2 -left-2 z-50 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center shadow-lg cursor-pointer border-2 border-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            aria-label="Remover widget"
          >
            <X className="w-3 h-3" />
          </button>
          
          <div className="drag-handle absolute -top-2 -right-2 p-1 bg-gray-500 text-white rounded-full cursor-grab active:cursor-grabbing z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-600 hover:scale-110 shadow-lg w-6 h-6 flex items-center justify-center">
            <GripVertical size={12} className="drop-shadow" />
          </div>
        </>
      )}
      
      <div 
        className={cn(
          "relative rounded-xl shadow-lg border-border/10 overflow-hidden flex flex-col h-full w-full",
          isGlassmorphism ? "bg-white/10 dark:bg-black/10 backdrop-blur-sm border" : "bg-card border"
        )}
      >
        <div className={cn("h-full w-full", isEditing && "no-drag")}>
          {renderSpecificWidget()}
        </div>
      </div>
    </div>
  );
};

export default memo(WidgetRenderer, (prevProps, nextProps) => {
  return (
    prevProps.widget.id === nextProps.widget.id &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.autoFocus === nextProps.autoFocus &&
    prevProps.widget.conteudo === nextProps.widget.conteudo
  );
});