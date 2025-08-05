import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, StickyNote, ListTodo, Trello, Loader2, Edit, Save, X } from 'lucide-react';

const BoardsHeader = ({
  isEditing,
  isSaving,
  onEditToggle,
  onSave,
  onCancel,
  onAddWidget,
  onAddBoard,
}) => {
  return (
    <header className="flex items-center justify-between mb-6 flex-wrap gap-2">
      <h1 className="text-2xl sm:text-3xl font-bold">Mesa de Trabalho</h1>
      <div className="flex gap-2 flex-wrap">
        {isEditing ? (
          <>
            <Button onClick={onCancel} variant="outline" disabled={isSaving}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Layout
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => onAddWidget('nota')} variant="outline"><StickyNote className="w-4 h-4 mr-2" /> Nova Anotação</Button>
            <Button onClick={() => onAddWidget('lista_tarefas')} variant="outline"><ListTodo className="w-4 h-4 mr-2" /> Nova Lista</Button>
            <Button onClick={onAddBoard}><Trello className="w-4 h-4 mr-2" /> Novo Quadro</Button>
            <Button onClick={onEditToggle} variant="ghost" size="icon" className="ml-2" title="Personalizar Layout">
              <Edit className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default BoardsHeader;