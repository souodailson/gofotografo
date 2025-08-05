import React from 'react';
import BlockRenderer from './BlockRenderer';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BlockContainer = ({ block, setSelectedBlock, isSelected, updateBlock }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    updateBlock(block.id, null); // Signal deletion
  };

  return (
    <div
      data-block-id={block.id}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: 'move',
        outline: isSelected ? '2px solid #3B82F6' : 'none',
        outlineOffset: '2px',
        transition: 'outline 0.2s ease-in-out',
      }}
      onClick={(e) => { e.stopPropagation(); setSelectedBlock(block); }}
    >
      <BlockRenderer block={block} isSelected={isSelected} updateBlock={updateBlock} />
      {isSelected && (
        <>
          <div className="absolute -top-3 -right-3 z-30">
            <Button variant="destructive" size="icon" className="h-6 w-6" onClick={handleDelete}>
              <Trash2 size={12} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default BlockContainer;