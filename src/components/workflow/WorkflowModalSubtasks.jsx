import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Info } from 'lucide-react';

const WorkflowModalSubtasks = ({ subtasks, onAddSubtask, onToggleSubtask, onDeleteSubtask, cardExists }) => {
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const handleInternalAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    onAddSubtask(newSubtaskText);
    setNewSubtaskText('');
  };

  if (!cardExists) {
    return (
      <div className="text-center p-4 text-slate-500 dark:text-slate-400">
          <Info size={24} className="mx-auto mb-2" />
          Salve o card primeiro para adicionar ou gerenciar subtarefas.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input 
          type="text" 
          placeholder="Nova subtarefa..." 
          value={newSubtaskText}
          onChange={(e) => setNewSubtaskText(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter') handleInternalAddSubtask();}}
          className="flex-grow"
        />
        <Button onClick={handleInternalAddSubtask}><Plus className="w-4 h-4 mr-2" />Adicionar</Button>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {(subtasks || []).map((subtask) => (
          <div key={subtask.id || subtask.text} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded-md group">
            <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={() => onToggleSubtask(subtask.id)}
              />
              <span className={subtask.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''}>
                {subtask.text}
              </span>
            </label>
            <Button variant="ghost" size="icon" className="w-6 h-6 opacity-0 group-hover:opacity-100" onClick={() => onDeleteSubtask(subtask.id)}>
              <Trash2 size={14} className="text-red-500" />
            </Button>
          </div>
        ))}
        {(subtasks || []).length === 0 && (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma subtarefa adicionada.</p>
        )}
      </div>
    </div>
  );
};

export default WorkflowModalSubtasks;