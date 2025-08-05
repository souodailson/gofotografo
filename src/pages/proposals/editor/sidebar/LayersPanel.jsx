import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Eye, EyeOff, Lock, Unlock, Type, Image, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const blockTypeIcons = {
  text: <Type size={16} />,
  image: <Image size={16} />,
  default: <div className="w-4 h-4 bg-gray-300 rounded-sm" />,
};

const LayerItem = ({ block, index, selectedBlockId, setSelectedBlock, toggleVisibility, toggleLock, deleteBlock, updateBlockContent }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(block.content?.text || '');

    const handleDoubleClick = () => {
        if (block.type === 'text') {
            setIsEditing(true);
        }
    };

    const handleTextChange = (e) => {
        setEditText(e.target.value);
    };

    const handleTextBlur = () => {
        setIsEditing(false);
        updateBlockContent(block.id, { text: editText });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleTextBlur();
        }
    };

    return (
        <Draggable key={block.id} draggableId={block.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                        "flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-transparent",
                        snapshot.isDragging && "bg-primary/10",
                        selectedBlockId === block.id && "border-primary"
                    )}
                    onClick={() => setSelectedBlock(block)}
                    onDoubleClick={handleDoubleClick}
                >
                    <div {...provided.dragHandleProps} className="cursor-grab text-muted-foreground hover:text-foreground">
                        <GripVertical size={16} />
                    </div>
                    <div className="flex-shrink-0 text-muted-foreground">{blockTypeIcons[block.type] || blockTypeIcons.default}</div>
                    
                    {isEditing ? (
                        <Input
                            value={editText}
                            onChange={handleTextChange}
                            onBlur={handleTextBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="h-7 text-sm flex-grow bg-background"
                        />
                    ) : (
                        <span className="flex-grow text-sm truncate">{block.content?.text || block.type}</span>
                    )}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}>
                                <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Excluir</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleLock(block.id); }}>
                                {block.locked ? <Lock size={14} className="text-destructive" /> : <Unlock size={14} />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{block.locked ? 'Desbloquear' : 'Bloquear'}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleVisibility(block.id); }}>
                                {(block.visible ?? true) ? <Eye size={14} /> : <EyeOff size={14} className="text-muted-foreground"/>}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{(block.visible ?? true) ? 'Ocultar' : 'Mostrar'}</p></TooltipContent>
                    </Tooltip>
                </div>
            )}
        </Draggable>
    );
};

const LayersPanel = ({ sectionId, proposal, setProposal, setSelectedBlock, selectedBlockId }) => {
  const blocks = (proposal.blocksBySection[sectionId] || []).sort((a, b) => (b.styles?.zIndex || 0) - (a.styles?.zIndex || 0));

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setProposal(prev => {
        const newBlocks = [...prev.blocksBySection[sectionId]];
        items.reverse().forEach((block, index) => {
            const blockToUpdate = newBlocks.find(b => b.id === block.id);
            if (blockToUpdate) {
                blockToUpdate.styles = { ...blockToUpdate.styles, zIndex: index };
            }
        });
        return {
            ...prev,
            blocksBySection: { ...prev.blocksBySection, [sectionId]: newBlocks }
        };
    });
  };

  const updateBlockProperty = (blockId, property, value) => {
    setProposal(prev => {
        const newBlocks = prev.blocksBySection[sectionId].map(b => 
            b.id === blockId ? { ...b, [property]: value } : b
        );
        return {
            ...prev,
            blocksBySection: { ...prev.blocksBySection, [sectionId]: newBlocks }
        };
    });
  };

  const updateBlockContent = (blockId, newContent) => {
    setProposal(prev => {
        const newBlocks = prev.blocksBySection[sectionId].map(b => 
            b.id === blockId ? { ...b, content: { ...b.content, ...newContent } } : b
        );
        return {
            ...prev,
            blocksBySection: { ...prev.blocksBySection, [sectionId]: newBlocks }
        };
    });
  };

  const deleteBlock = (blockId) => {
    setProposal(prev => {
        const newBlocks = prev.blocksBySection[sectionId].filter(b => b.id !== blockId);
        if (selectedBlockId === blockId) {
            setSelectedBlock(null);
        }
        return {
            ...prev,
            blocksBySection: { ...prev.blocksBySection, [sectionId]: newBlocks }
        };
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="layers">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
            <TooltipProvider>
            {blocks.map((block, index) => (
              <LayerItem
                key={block.id}
                block={block}
                index={index}
                selectedBlockId={selectedBlockId}
                setSelectedBlock={setSelectedBlock}
                toggleVisibility={(id) => updateBlockProperty(id, 'visible', !(block.visible ?? true))}
                toggleLock={(id) => updateBlockProperty(id, 'locked', !block.locked)}
                deleteBlock={deleteBlock}
                updateBlockContent={updateBlockContent}
              />
            ))}
            {provided.placeholder}
            </TooltipProvider>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default LayersPanel;