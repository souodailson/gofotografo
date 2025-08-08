import React, { useRef, useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useProposalManager } from '@/hooks/useProposalManager';
import { useEditorState } from '@/hooks/useEditorState';
import { useBlockActions } from '@/hooks/useBlockActions';
import { useEditorInteractions } from '@/hooks/useEditorInteractions';
import EditorCanvas from '@/pages/proposals/editor/EditorCanvas';
import LeftSidebar from '@/pages/proposals/editor/LeftSidebar';
import RightSidebar from '@/pages/proposals/editor/RightSidebar';
import SectionsManager from '@/pages/proposals/editor/SectionsManager';
import EditorHeader from '@/pages/proposals/editor/EditorHeader';
import EditorToolbars from '@/pages/proposals/editor/EditorToolbars';
import ContextMenu from '@/pages/proposals/editor/ContextMenu';
import FullScreenLoader from '@/components/FullScreenLoader';
import { AnimatePresence } from 'framer-motion';
import { PanelLeftOpen, PanelRightOpen, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditorRulers from '@/pages/proposals/editor/EditorRulers';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { sanitizeFilename } from '@/lib/utils';
import PublishSuccessModal from './PublishSuccessModal';

const HorizontalResizeHandle = ({ onResize }) => {
    const handleRef = useRef(null);

    const handleMouseDown = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = handleRef.current.parentElement.getBoundingClientRect().width;

        const handleMouseMove = (moveEvent) => {
            requestAnimationFrame(() => {
                const currentX = moveEvent.clientX;
                const diffX = currentX - startX;
                onResize(startWidth + diffX);
            });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div
            ref={handleRef}
            className="absolute top-0 -right-2 h-full w-4 cursor-ew-resize flex items-center justify-center transition-opacity z-50"
            onMouseDown={handleMouseDown}
        >
            <GripVertical className="text-muted-foreground" />
        </div>
    );
};


const ProposalEditorPage = ({ isAdmin = false }) => {
  const manager = useProposalManager({ isAdmin });
  const { proposal, setProposal, proposalId, isNew, activeSection, setActiveSection, loading, saving, saveStatus, uploads, loadingUploads, handleSave, handlePublish, fetchUploads } = manager;
  
  const editorState = useEditorState(setProposal);
  const { selectedBlock, handleSetSelectedBlock, viewMode, setViewMode, canvasWidth, setCanvasWidth, isLeftSidebarOpen, setIsLeftSidebarOpen, isRightSidebarOpen, setIsRightSidebarOpen, snapLines, setSnapLines, toolbarPosition } = editorState;

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');

  const { addBlock, updateBlock } = useBlockActions(setProposal, handleSetSelectedBlock, viewMode);
  
  const canvasRef = useRef(null);
  const interactions = useEditorInteractions({
    selectedBlock,
    updateBlock,
    addBlock,
    activeSection,
    canvasRef,
    viewMode,
    setViewMode,
    proposalName: proposal?.nome_da_proposta,
  });
  const { fileInputRef, handleFileInputClick } = interactions;

  const { user } = useData();
  const { toast } = useToast();
  const scrollContainerRef = useRef(null);

  const handleFileUpload = async (event, blockToUpdate) => {
    const file = event.target.files?.[0];
    if (!file || !user || !blockToUpdate) return;

    if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Arquivo muito grande", description: `O arquivo excede o limite de 10MB.`, variant: "destructive" });
        return;
    }
  
    toast({ title: 'Enviando arquivo...', description: 'Aguarde um momento.' });
  
    const sanitizedName = sanitizeFilename(file.name);
    const filePath = `${user.id}/${proposalId || 'new'}/${uuidv4()}-${sanitizedName}`;
  
    const { error: uploadError } = await supabase.storage.from('propostas').upload(filePath, file);
  
    if (uploadError) {
      toast({ title: 'Erro no upload', description: uploadError.message, variant: 'destructive' });
      return;
    }
  
    const { data: { publicUrl } } = supabase.storage.from('propostas').getPublicUrl(filePath);
      
    if (blockToUpdate.type === 'image') {
        updateBlock(blockToUpdate.id, { content: { ...blockToUpdate.content, src: publicUrl } });
    } else if (blockToUpdate.type === 'pdf') {
        updateBlock(blockToUpdate.id, { content: { src: publicUrl } });
    }
    
    fetchUploads(proposalId);
    toast({ title: 'Arquivo atualizado!', variant: 'success' });

    event.target.value = '';
  };

  const onPublishClick = async () => {
    const resultUrl = await handlePublish();
    if (resultUrl) {
      setPublicUrl(resultUrl);
      setPublishModalOpen(true);
    }
  };


  if (loading || !proposal) return <FullScreenLoader />;

  return (
    <DndProvider backend={HTML5Backend}>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-full fixed inset-0 overflow-hidden" onClick={interactions.closeContextMenu}>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden"
            onChange={(e) => handleFileUpload(e, selectedBlock)}
            accept={selectedBlock?.type === 'pdf' ? 'application/pdf' : 'image/*'}
          />
          <AnimatePresence>
            {isLeftSidebarOpen && (
              <LeftSidebar 
                onAddBlock={addBlock}
                activeSection={activeSection}
                uploads={uploads}
                loadingUploads={loadingUploads}
                proposalId={proposalId}
                onUploadComplete={() => fetchUploads(proposalId)}
                isNew={isNew}
                handleSave={() => handleSave()}
                onToggle={() => setIsLeftSidebarOpen(false)}
              />
            )}
          </AnimatePresence>

          <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out app-toolbar">
            <EditorHeader
              navigateBack={() => handleSave(true)}
              viewMode={viewMode}
              setViewMode={setViewMode}
              handleExportPdf={interactions.handleExportPdf}
              handleSave={() => handleSave()}
              handlePublish={onPublishClick}
              saving={saving}
              saveStatus={saveStatus}
              isAdmin={isAdmin}
              proposal={proposal}
            />
            <EditorToolbars
              selectedBlock={selectedBlock}
              updateBlock={updateBlock}
              toolbarPosition={toolbarPosition}
              onReplaceImage={() => handleFileInputClick()}
            />

            <div ref={scrollContainerRef} className="flex-1 overflow-auto bg-muted/40 p-4 sm:p-8 relative flex justify-center studio-editor-container" onClick={() => handleSetSelectedBlock(null)}>
              <EditorRulers scrollContainerRef={scrollContainerRef} />
              {!isLeftSidebarOpen && (
                <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-30" onClick={() => setIsLeftSidebarOpen(true)}><PanelLeftOpen /></Button>
              )}
              {!isRightSidebarOpen && selectedBlock && (
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-30" onClick={() => setIsRightSidebarOpen(true)}><PanelRightOpen /></Button>
              )}
              
              <div 
                className="mx-auto transition-all duration-300 relative group/canvas-container"
                style={{ width: `${canvasWidth}px` }}
                onClick={(e) => e.stopPropagation()}
              >
                <EditorCanvas
                  ref={canvasRef}
                  sections={proposal.sections}
                  blocksBySection={proposal.blocksBySection}
                  addBlock={addBlock}
                  setSelectedBlock={handleSetSelectedBlock}
                  selectedBlockId={selectedBlock?.id}
                  updateBlock={updateBlock}
                  showGrid={editorState.showGrid}
                  globalStyles={proposal.theme}
                  activeSection={activeSection}
                  viewMode={viewMode}
                  setProposal={setProposal}
                  onContextMenu={interactions.handleContextMenu}
                  setSnapLines={setSnapLines}
                />
                <HorizontalResizeHandle onResize={setCanvasWidth} />
                {snapLines.map((line, index) => (
                  <div key={index} className="absolute bg-orange-300" style={{ ...(line.type === 'vertical' ? { left: line.position, top: 0, width: '1px', height: '100%' } : { top: line.position, left: 0, height: '1px', width: '100%' }), zIndex: 99998 }}/>
                ))}
              </div>
            </div>
            <SectionsManager sections={proposal.sections} activeSection={activeSection} setActiveSection={setActiveSection} setProposal={setProposal} proposal={proposal} />
          </main>

          <AnimatePresence>
            {isRightSidebarOpen && (
              <RightSidebar
                selectedBlock={selectedBlock}
                updateBlock={updateBlock}
                setSelectedBlock={handleSetSelectedBlock}
                globalStyles={proposal.theme}
                setGlobalStyles={(newTheme) => setProposal(p => ({ ...p, theme: newTheme }))}
                showGrid={editorState.showGrid}
                setShowGrid={editorState.setShowGrid}
                proposal={proposal}
                setProposal={setProposal}
                isAdmin={isAdmin}
                onToggle={() => setIsRightSidebarOpen(false)}
                onUploadComplete={() => fetchUploads(proposalId)}
                viewMode={viewMode}
              />
            )}
          </AnimatePresence>

          {interactions.contextMenu && (
            <ContextMenu
              x={interactions.contextMenu.x} y={interactions.contextMenu.y} block={interactions.contextMenu.block} onClose={interactions.closeContextMenu}
              onAction={interactions.handleContextMenuAction}
              onFileInputClick={handleFileInputClick}
            />
          )}

          <PublishSuccessModal
            isOpen={publishModalOpen}
            onClose={() => setPublishModalOpen(false)}
            publicUrl={publicUrl}
            proposalName={proposal?.nome_da_proposta}
          />
        </div>
    </DndProvider>
  );
};

export default ProposalEditorPage;