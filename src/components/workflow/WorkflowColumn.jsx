import React, { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Trash2, Plus, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WorkflowCard from '@/components/workflow/WorkflowCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { twMerge } from 'tailwind-merge';

const getColumnBgColor = (colorClass, theme) => {
  if (!colorClass || colorClass.includes('slate')) {
    return 'bg-muted/30 dark:bg-muted/10';
  }
  const darkColor = colorClass.split('dark:')[1];
  if (theme === 'dark' && darkColor) {
    const baseColor = darkColor.replace(/-\d+/, '');
    return `${baseColor.split(' ')[0]}`;
  }
  return colorClass.split(' ')[0];
};

const WorkflowColumn = ({ column, index, onAddCard, onEditCard, onSaveColumnSettings, onDeleteColumn, onDeleteCard, onArchiveCard, defaultColors, cardViewMode }) => {
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [editingColumnName, setEditingColumnName] = useState("");
  const [editingColumnColor, setEditingColumnColor] = useState(column.color || 'bg-card');
  const { updateWorkflowCard, addComment } = useData();
  const { theme } = useTheme();

  const handleEditColumn = (col) => {
    setEditingColumnId(col.id);
    setEditingColumnName(col.title);
    setEditingColumnColor(col.color || 'bg-card');
  };

  const handleSaveSettingsLocal = () => {
    if (editingColumnName.trim()) {
      onSaveColumnSettings(editingColumnId, editingColumnName, editingColumnColor);
    }
    setEditingColumnId(null);
    setEditingColumnName("");
  };

  const handleUpdateSubtask = async (cardId, subtaskId, completed) => {
    const cardToUpdate = column.cards.find(c => c.id === cardId);
    if (!cardToUpdate) return;
    const updatedSubtasks = (cardToUpdate.subtasks || []).map((task) =>
      task.id === subtaskId ? { ...task, completed } : task
    );
    await updateWorkflowCard(cardId, { subtasks: updatedSubtasks });
  };

  const handleAddSubtask = async (cardId, subtaskText) => {
    const cardToUpdate = column.cards.find(c => c.id === cardId);
    if (!cardToUpdate || !subtaskText.trim()) return;
    const newSubtask = { id: Math.random().toString(36).substr(2, 9), text: subtaskText.trim(), completed: false };
    const updatedSubtasks = [...(cardToUpdate.subtasks || []), newSubtask];
    await updateWorkflowCard(cardId, { subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = async (cardId, subtaskId) => {
    const cardToUpdate = column.cards.find(c => c.id === cardId);
    if (!cardToUpdate) return;
    const updatedSubtasks = (cardToUpdate.subtasks || []).filter(task => task.id !== subtaskId);
    await updateWorkflowCard(cardId, { subtasks: updatedSubtasks });
  };

  const getColumnHeaderBackgroundColor = () => {
    const currentColumnColor = column.color || 'bg-card';
    if (currentColumnColor === 'bg-card' || currentColumnColor.includes('slate')) {
      return 'bg-accent dark:bg-accent';
    }
    return currentColumnColor;
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {(providedDraggable) => (
        <div
          ref={providedDraggable.innerRef}
          {...providedDraggable.draggableProps}
          className="w-[300px] sm:w-[350px] flex-shrink-0"
        >
          <div className={twMerge("rounded-xl shadow-lg border border-border/50 flex flex-col h-full max-h-full", getColumnBgColor(column.color, theme))}>
            <div
              {...providedDraggable.dragHandleProps}
              className={twMerge(`p-3 rounded-t-xl flex items-center justify-between text-foreground cursor-grab`)}
            >
              {editingColumnId === column.id ? (
                <div className="flex flex-col w-full space-y-2">
                  <Input
                    value={editingColumnName}
                    onChange={(e) => setEditingColumnName(e.target.value)}
                    className="bg-background text-foreground border-border placeholder-muted-foreground"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveSettingsLocal()}
                  />
                  <div className="flex flex-wrap gap-1">
                    {defaultColors.map(colorOption => (
                      <button
                        key={colorOption}
                        type="button"
                        onClick={() => setEditingColumnColor(colorOption)}
                        className={`w-5 h-5 rounded-full border-2 ${editingColumnColor === colorOption ? 'border-foreground ring-2 ring-offset-1 ring-offset-transparent ring-primary' : 'border-transparent'} ${theme === 'dark' ? colorOption.split('dark:')[1]?.split(' ')[0] || colorOption.split(' ')[0] : colorOption.split(' ')[0]}`}
                        aria-label={`Selecionar cor ${colorOption}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingColumnId(null)} className="text-muted-foreground hover:bg-accent">Cancelar</Button>
                    <Button size="sm" variant="ghost" onClick={handleSaveSettingsLocal} className="text-muted-foreground hover:bg-accent">Salvar</Button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditColumn(column)} className="w-6 h-6 text-muted-foreground hover:bg-accent">
                      <Palette size={14} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:bg-accent">
                          <Trash2 size={14} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Coluna?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a coluna "{column.title}"?
                            {(column.cards && column.cards.length > 0) && " Esta coluna contém cards. Mova-os antes de excluir."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteColumn(column.id)} disabled={column.cards && column.cards.length > 0} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <span className="bg-background/50 text-foreground px-1.5 py-0.5 rounded-full text-xs">
                      {column.cards?.length || 0}
                    </span>
                  </div>
                </>
              )}
            </div>
            <Droppable droppableId={column.id} type="CARD">
              {(providedDrop, snapshotDrop) => (
                <div
                  ref={providedDrop.innerRef}
                  {...providedDrop.droppableProps}
                  className={twMerge(`p-3 space-y-3 transition-colors min-h-[100px]`, snapshotDrop.isDraggingOver ? 'bg-accent/50' : '')}
                >
                  {(column.cards || []).map((card, cardIndex) => (
                    <Draggable key={card.id} draggableId={card.id} index={cardIndex}>
                      {(providedCard) => (
                        <div
                          ref={providedCard.innerRef}
                          {...providedCard.draggableProps}
                          {...providedCard.dragHandleProps}
                        >
                          <WorkflowCard
                            card={card}
                            onEdit={onEditCard}
                            onUpdateSubtask={handleUpdateSubtask}
                            onAddSubtask={handleAddSubtask}
                            onDeleteSubtask={handleDeleteSubtask}
                            onDeleteCard={onDeleteCard}
                            onArchiveCard={onArchiveCard}
                            columnColor={column.color}
                            onAddComment={addComment}
                            viewMode={cardViewMode}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {providedDrop.placeholder}
                </div>
              )}
            </Droppable>
            <div className="p-3 mt-auto border-t border-border flex-shrink-0">
              <Button
                variant="outline"
                className="w-full border-dashed border-2 h-10 text-muted-foreground hover:text-foreground"
                onClick={() => onAddCard(column.id)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Card
              </Button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default WorkflowColumn;