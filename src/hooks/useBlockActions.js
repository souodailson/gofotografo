import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep, set, get, merge } from 'lodash';
import { useToast } from '@/components/ui/use-toast';

export const useBlockActions = (setProposal, setSelectedBlock, viewMode) => {
  const { toast } = useToast();

  const updateBlock = useCallback((blockId, newProps, targetViewMode) => {
    const currentViewMode = targetViewMode || viewMode;

    setProposal(prev => {
      if (!prev) return null;
      const sectionId = Object.keys(prev.blocksBySection).find(pId => prev.blocksBySection[pId].some(b => b.id === blockId));
      if (!sectionId) return prev;

      if (newProps === null) {
        setSelectedBlock(null);
        const newBlocks = prev.blocksBySection[sectionId].filter(b => b.id !== blockId);
        return {
          ...prev,
          blocksBySection: { ...prev.blocksBySection, [sectionId]: newBlocks },
        };
      }

      const newBlocks = prev.blocksBySection[sectionId].map(b => {
        if (b.id !== blockId) return b;

        if (currentViewMode === 'desktop') {
          return merge({}, b, newProps);
        }

        const newBlock = cloneDeep(b);
        if (!newBlock.layouts) newBlock.layouts = {};
        if (!newBlock.layouts[currentViewMode]) newBlock.layouts[currentViewMode] = {};
        
        merge(newBlock.layouts[currentViewMode], newProps);
        
        return newBlock;
      });

      const updatedBlock = newBlocks.find(b => b.id === blockId);
      if (updatedBlock) {
        setSelectedBlock(updatedBlock);
      }
      return {
        ...prev,
        blocksBySection: { ...prev.blocksBySection, [sectionId]: newBlocks }
      };
    });
  }, [setProposal, setSelectedBlock, viewMode]);


  const addBlock = useCallback((block, targetSectionId, position) => {
    if (!targetSectionId) {
      toast({ title: 'Nenhuma seção selecionada', description: 'Por favor, selecione uma seção antes de adicionar um bloco.', variant: 'destructive' });
      return;
    }

    const newBlock = {
      ...cloneDeep(block),
      id: uuidv4(),
      position: position || { x: '20%', y: '20%' },
      size: block.size || { width: '50%', height: 'auto' },
      layouts: {
        desktop: {},
        tablet: {},
        mobile: {},
      }
    };
    
    if (newBlock.type === 'text') {
        newBlock.size.height = 'auto';
        if (newBlock.content.level === 'h1') {
            newBlock.size.width = '60%';
        } else if (newBlock.content.level === 'h2') {
            newBlock.size.width = '50%';
        } else {
            newBlock.size.width = '40%';
        }
    }


    setProposal(prev => {
      if (!prev) return null;
      const currentSectionBlocks = prev.blocksBySection[targetSectionId] || [];
      const newBlocks = [...currentSectionBlocks, newBlock];
      return {
        ...prev,
        blocksBySection: { ...prev.blocksBySection, [targetSectionId]: newBlocks },
      };
    });
    setSelectedBlock(newBlock);
  }, [setProposal, toast, setSelectedBlock]);

  return { addBlock, updateBlock };
};