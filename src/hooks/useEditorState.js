import { useState, useEffect, useCallback } from 'react';

export const useEditorState = (setProposal) => {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [viewMode, setViewMode] = useState('desktop');
  const [canvasWidth, setCanvasWidth] = useState(1024);
  const [showGrid, setShowGrid] = useState(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [snapLines, setSnapLines] = useState([]);

  useEffect(() => {
    if (selectedBlock) {
      setIsRightSidebarOpen(true);
    }
  }, [selectedBlock]);

  useEffect(() => {
    if (viewMode === 'desktop') {
        setCanvasWidth(1024);
    } else if (viewMode === 'tablet') {
        setCanvasWidth(768);
    } else if (viewMode === 'mobile') {
        setCanvasWidth(375);
    }
  }, [viewMode]);

  const handleSetSelectedBlock = useCallback((block) => {
    setSelectedBlock(block);
    if (block?.type === 'text' || block?.type === 'image') {
      setTimeout(() => {
        const blockElement = document.querySelector(`[data-block-id="${block.id}"]`);
        if (blockElement) {
          const rect = blockElement.getBoundingClientRect();
          setToolbarPosition({
            top: rect.top - 60,
            left: rect.left + rect.width / 2,
          });
        }
      }, 0);
    }
  }, []);

  return {
    selectedBlock,
    setSelectedBlock,
    handleSetSelectedBlock,
    viewMode,
    setViewMode,
    canvasWidth,
    setCanvasWidth,
    showGrid,
    setShowGrid,
    isLeftSidebarOpen,
    setIsLeftSidebarOpen,
    isRightSidebarOpen,
    setIsRightSidebarOpen,
    toolbarPosition,
    setToolbarPosition,
    snapLines,
    setSnapLines,
  };
};