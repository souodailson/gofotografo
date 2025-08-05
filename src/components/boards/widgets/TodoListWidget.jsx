import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useDebounce } from '@/hooks/useDebounce';
import { ScrollArea } from '@/components/ui/scroll-area';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

const TodoListItem = ({ 
  item, 
  onToggle, 
  onUpdate, 
  onDelete, 
  onAddNew, 
  isLast,
  isSelected,
  onSelect,
  inputRef
}) => {
  const [text, setText] = useState(item.text);
  const debouncedText = useDebounce(text, 500);

  useEffect(() => {
    if (debouncedText !== item.text) {
      onUpdate(item.id, debouncedText);
    }
  }, [debouncedText, item.text, item.id, onUpdate]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddNew(item.id);
    }
    if (e.key === 'Backspace' && text === '') {
      e.preventDefault();
      onDelete(item.id, 'up');
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-2 group py-1 border-b border-transparent",
        isSelected && "bg-blue-500/20 rounded-md"
      )}
      onClick={() => onSelect(item.id)}
    >
      <Checkbox
        id={`todo-${item.id}`}
        checked={item.completed}
        onCheckedChange={() => onToggle(item.id)}
        className="ml-1"
      />
      <Input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-8 flex-grow text-sm border-none focus:ring-0 bg-transparent p-1",
          "focus:bg-muted/50 rounded-md",
          item.completed ? 'line-through text-muted-foreground' : ''
        )}
      />
    </div>
  );
};

const TodoListWidget = ({ content, onContentChange, autoFocus = false }) => {
  const [title, setTitle] = useState(content?.title || 'Lista de Tarefas');
  const [items, setItems] = useState(content?.items || []);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const titleInputRef = useRef(null);
  const itemRefs = useRef({});

  useEffect(() => {
    if (autoFocus && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [autoFocus]);

  const debouncedTitle = useDebounce(title, 500);
  const debouncedItems = useDebounce(items, 500);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onContentChange({ title: debouncedTitle, items: debouncedItems });
  }, [debouncedTitle, debouncedItems, onContentChange]);
  
  const handleSetItems = (newItems) => {
    setItems(newItems);
    onContentChange({ title, items: newItems });
  }

  const handleAddNewItem = (afterId = null) => {
    const newItem = { id: uuidv4(), text: '', completed: false };
    let newItems;
    if (afterId) {
      const index = items.findIndex(item => item.id === afterId);
      newItems = [...items.slice(0, index + 1), newItem, ...items.slice(index + 1)];
    } else {
      newItems = [...items, newItem];
    }
    handleSetItems(newItems);
    
    setTimeout(() => {
        itemRefs.current[newItem.id]?.focus();
    }, 0);
  };

  const handleToggleItem = (id) => {
    const newItems = items.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    handleSetItems(newItems);
  };

  const handleDeleteItem = (id, focusDirection = null) => {
    const index = items.findIndex(item => item.id === id);
    const newItems = items.filter(item => item.id !== id);
    handleSetItems(newItems);

    if (focusDirection && newItems.length > 0) {
        let nextFocusIndex;
        if (focusDirection === 'up' && index > 0) {
            nextFocusIndex = index - 1;
        } else if (newItems.length > index) {
            nextFocusIndex = index;
        } else {
            nextFocusIndex = newItems.length - 1;
        }
        const nextFocusId = newItems[nextFocusIndex]?.id;
        if (nextFocusId) {
            setTimeout(() => itemRefs.current[nextFocusId]?.focus(), 0);
        }
    }
  };

  const handleUpdateItem = (id, newText) => {
    const newItems = items.map(item => item.id === id ? { ...item, text: newText } : item);
    handleSetItems(newItems);
  };

  const handleSelect = (id) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const handleContainerKeyDown = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItems.size > 0) {
      e.preventDefault();
      const newItems = items.filter(item => !selectedItems.has(item.id));
      handleSetItems(newItems);
      setSelectedItems(new Set());
    }
  };

  return (
    <div className="p-3 h-full flex flex-col" onKeyDown={handleContainerKeyDown} tabIndex={-1}>
      <Input
        ref={titleInputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-md font-bold border-none focus:ring-0 bg-transparent p-1 mb-2"
      />
      <ScrollArea className="flex-grow">
        <div className="space-y-0 pr-2">
          {items.map((item, index) => (
            <TodoListItem
              key={item.id}
              item={item}
              onToggle={handleToggleItem}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
              onAddNew={handleAddNewItem}
              isLast={index === items.length - 1}
              isSelected={selectedItems.has(item.id)}
              onSelect={handleSelect}
              inputRef={el => itemRefs.current[item.id] = el}
            />
          ))}
        </div>
      </ScrollArea>
      <button 
        onClick={() => handleAddNewItem()} 
        className="mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-left pl-8"
      >
        + Adicionar tarefa
      </button>
    </div>
  );
};

export default TodoListWidget;