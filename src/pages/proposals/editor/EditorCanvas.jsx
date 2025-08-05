import React, { forwardRef, useRef, useCallback, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import { cn } from '@/lib/utils';
import DraggablePositionedBlock from './DraggablePositionedBlock';

function hexToRgba(hex, alpha = 1) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const VerticalResizeHandle = ({ onResize, onResizeStop }) => {
    const handleRef = useRef(null);

    const handleMouseDown = (e) => {
        e.preventDefault();
        const startY = e.clientY;
        const startHeight = handleRef.current.parentElement.parentElement.getBoundingClientRect().height;

        const handleMouseMove = (moveEvent) => {
            requestAnimationFrame(() => {
                const currentY = moveEvent.clientY;
                const diffY = currentY - startY;
                onResize(startHeight + diffY);
            });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            onResizeStop();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className="w-full flex justify-center absolute -bottom-2 left-0 z-10">
            <div
                ref={handleRef}
                className="w-full h-4 flex items-center justify-center cursor-ns-resize group/resizer"
                onMouseDown={handleMouseDown}
            >
                <div className="w-10 h-1.5 bg-primary/40 rounded-full group-hover/resizer:bg-primary/70 transition-colors" />
            </div>
        </div>
    );
};

const DroppableSection = forwardRef(({ section, blocks, setSelectedBlock, selectedBlockId, updateBlock, showGrid, viewMode, addBlock, onSectionResize, moveBlock, setProposal, onContextMenu, setSnapLines }, ref) => {
    const sectionRef = useRef(null);
    
    const getResponsiveSectionHeight = useCallback(() => {
        if (viewMode !== 'desktop' && section.layouts?.[viewMode]?.height) {
            return section.layouts[viewMode].height;
        }
        return section.height || 500;
    }, [section, viewMode]);

    const [currentHeight, setCurrentHeight] = useState(getResponsiveSectionHeight());

    useEffect(() => {
        setCurrentHeight(getResponsiveSectionHeight());
    }, [section, viewMode, getResponsiveSectionHeight]);

    const handleDropOnSection = (url) => {
      setProposal(prev => {
        const newSections = prev.sections.map(s => {
          if (s.id === section.id) {
            return { ...s, styles: { ...s.styles, backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 } };
          }
          return s;
        });
        return { ...prev, sections: newSections };
      });
    };

    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: [ItemTypes.BLOCK, ItemTypes.IMAGE_UPLOAD, ItemTypes.POSITIONED_BLOCK],
        drop: (item, monitor) => {
            const didDropInBlock = monitor.didDrop();
            if (didDropInBlock || !sectionRef.current) return;
            
            const dropPosition = monitor.getClientOffset();
            const sectionRect = sectionRef.current.getBoundingClientRect();
            
            const blockToAdd = item.url ? JSON.parse(item.data) : item;
            
            if (blockToAdd.type === 'pdf') {
                const pdfBlock = {
                    ...blockToAdd,
                    position: { x: '0%', y: '0%' },
                    size: { width: '100%', height: '100%' },
                    styles: { ...blockToAdd.styles, zIndex: 1 } 
                };
                addBlock(pdfBlock, section.id);
            } else {
                const xPercent = ((dropPosition.x - sectionRect.left) / sectionRect.width) * 100;
                const yPercent = ((dropPosition.y - sectionRect.top) / sectionRect.height) * 100;
                const position = { x: `${xPercent}%`, y: `${yPercent}%` };

                if (monitor.getItemType() === ItemTypes.IMAGE_UPLOAD) {
                    handleDropOnSection(item.url);
                } else if (monitor.getItemType() === ItemTypes.POSITIONED_BLOCK) {
                    if (item.sectionId !== section.id) {
                        moveBlock(item.id, section.id, position);
                    }
                } else {
                    addBlock(blockToAdd, section.id, position);
                }
            }
            
            return { droppedOnSection: true };
        },
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
            canDrop: monitor.canDrop(),
        }),
    }), [addBlock, moveBlock, section.id, setProposal]);

    drop(sectionRef);

    const handleResize = (newHeight) => {
        setCurrentHeight(newHeight);
        onSectionResize(section.id, newHeight, false, viewMode);
    };

    const handleResizeStop = () => {
        onSectionResize(section.id, currentHeight, true, viewMode);
    };

    const handlePdfHeightChange = useCallback((blockId, newHeight) => {
        onSectionResize(section.id, newHeight, true, viewMode);
    }, [section.id, onSectionResize, viewMode]);

    const sectionStyles = {
        ...section.styles,
        position: 'relative',
        width: '100%',
        height: `${currentHeight}px`,
        backgroundColor: hexToRgba(section.styles?.backgroundColor, section.styles?.backgroundOpacity),
        backgroundImage: section.styles?.backgroundImage ? `url(${section.styles.backgroundImage})` : 'none',
        backgroundSize: section.styles?.backgroundSize || 'cover',
        backgroundPosition: section.styles?.backgroundPosition || 'center',
        backgroundRepeat: section.styles?.backgroundRepeat || 'no-repeat',
        overflow: 'visible',
    };

    const handleSectionClick = (e) => {
        if (e.target === sectionRef.current) {
            const responsiveHeight = getResponsiveSectionHeight();
            setSelectedBlock({ id: section.id, type: 'section', styles: section.styles, height: responsiveHeight, layouts: section.layouts });
        }
    };

    const handleSectionContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const responsiveHeight = getResponsiveSectionHeight();
        const sectionBlock = { id: section.id, type: 'section', styles: section.styles, height: responsiveHeight, layouts: section.layouts };
        setSelectedBlock(sectionBlock);
        onContextMenu(e, sectionBlock);
    };

    const pdfBlock = blocks.find(b => b.type === 'pdf');

    return (
      <div ref={ref} className="relative mb-4">
        <div
          ref={sectionRef}
          className={cn(
            "bg-background relative w-full",
            isOver && canDrop && "bg-blue-50 dark:bg-blue-900/20"
          )}
          style={sectionStyles}
          onClick={handleSectionClick}
          onContextMenu={handleSectionContextMenu}
        >
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="h-full w-full bg-transparent bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>
          )}
          
          {blocks.map(block => (
              <DraggablePositionedBlock
                key={block.id}
                block={block}
                updateBlock={updateBlock}
                setSelectedBlock={setSelectedBlock}
                isSelected={selectedBlockId === block.id}
                onContextMenu={onContextMenu}
                sectionRef={sectionRef}
                otherBlocks={blocks.filter(b => b.id !== block.id)}
                setSnapLines={setSnapLines}
                viewMode={viewMode}
                sectionId={section.id}
                onPdfHeightChange={(newHeight) => handlePdfHeightChange(block.id, newHeight)}
              />
          ))}

          {!pdfBlock && blocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
              <p>Arraste um bloco ou imagem para esta seção</p>
            </div>
          )}
        </div>
        {!pdfBlock && (
            <VerticalResizeHandle onResize={handleResize} onResizeStop={handleResizeStop} />
        )}
      </div>
    );
});

const EditorCanvas = forwardRef(({ sections = [], blocksBySection = {}, addBlock, setSelectedBlock, selectedBlockId, updateBlock, showGrid, globalStyles, activeSection, viewMode, setProposal, onContextMenu, setSnapLines }, ref) => {
  const sectionRefs = useRef({});

  const onSectionResize = (sectionId, newHeight, isFinal, currentViewMode) => {
    setProposal(prev => {
      const newSections = prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        
        const updatedSection = { ...s };
        if (currentViewMode === 'desktop') {
          updatedSection.height = newHeight;
        } else {
          if (!updatedSection.layouts) updatedSection.layouts = {};
          if (!updatedSection.layouts[currentViewMode]) updatedSection.layouts[currentViewMode] = {};
          updatedSection.layouts[currentViewMode].height = newHeight;
        }
        updatedSection.isResizing = !isFinal;
        return updatedSection;
      });
      return { ...prev, sections: newSections };
    });
  };

  const moveBlock = (blockId, newSectionId, position) => {
    setProposal(prev => {
      let blockToMove;
      const newBlocksBySection = { ...prev.blocksBySection };

      for (const sectionId in newBlocksBySection) {
        const blockIndex = newBlocksBySection[sectionId].findIndex(b => b.id === blockId);
        if (blockIndex > -1) {
          [blockToMove] = newBlocksBySection[sectionId].splice(blockIndex, 1);
          break;
        }
      }

      if (blockToMove) {
        blockToMove.position = position;
        if (!newBlocksBySection[newSectionId]) {
          newBlocksBySection[newSectionId] = [];
        }
        newBlocksBySection[newSectionId].push(blockToMove);
      }

      return { ...prev, blocksBySection: newBlocksBySection };
    });
  };

  return (
    <div ref={ref} className="bg-white shadow-lg" style={{ fontFamily: globalStyles?.fontFamily?.body }}>
      {sections.map(section => (
        <DroppableSection
          key={section.id}
          ref={el => sectionRefs.current[section.id] = el}
          section={section}
          blocks={blocksBySection[section.id] || []}
          setSelectedBlock={setSelectedBlock}
          selectedBlockId={selectedBlockId}
          updateBlock={updateBlock}
          showGrid={showGrid}
          viewMode={viewMode}
          addBlock={addBlock}
          onSectionResize={onSectionResize}
          moveBlock={moveBlock}
          setProposal={setProposal}
          onContextMenu={onContextMenu}
          setSnapLines={setSnapLines}
        />
      ))}
    </div>
  );
});

export default EditorCanvas;