import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const useEditorInteractions = ({ selectedBlock, updateBlock, addBlock, activeSection, canvasRef, viewMode, setViewMode, proposalName }) => {
  const { toast } = useToast();
  const [contextMenu, setContextMenu] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const fileInputRef = useRef(null);

  const handleContextMenu = useCallback((event, block) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      block,
    });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const handleContextMenuAction = useCallback((action, block) => {
    if (action === 'copy') {
      setClipboard(block);
      toast({ title: "Copiado!" });
    } else if (action === 'paste' && clipboard) {
      const newPosition = {
        x: `${(contextMenu.x % (canvasRef.current?.offsetWidth || 800)) / (canvasRef.current?.offsetWidth || 800) * 100}%`,
        y: `${((contextMenu.y - (canvasRef.current?.getBoundingClientRect().top || 0)) / (canvasRef.current?.offsetHeight || 1200)) * 100}%`
      };
      addBlock(clipboard, activeSection, newPosition);
    } else if (action === 'duplicate') {
      const newPosition = {
        x: `${(parseFloat(block.position?.x) || 0) + 2}%`,
        y: `${(parseFloat(block.position?.y) || 0) + 2}%`,
      };
      addBlock(block, activeSection, newPosition);
    } else if (action === 'delete') {
      updateBlock(block.id, null);
    } else if (action === 'toggleLock') {
      updateBlock(block.id, { locked: !block.locked });
    } else if (action === 'remove_pdf_src') {
      updateBlock(block.id, { content: { ...block.content, src: null } });
    } else if (action.startsWith('layer_')) {
      const zIndex = block.styles?.zIndex || (block.type === 'pdf' ? 1 : 10);
      const layerActions = {
        'layer_top': 999,
        'layer_front': zIndex + 1,
        'layer_back': Math.max(0, zIndex - 1),
        'layer_bottom': 0
      };
      if (block.type === 'pdf' && (action === 'layer_top' || action === 'layer_bottom')) return;
      
      updateBlock(block.id, { styles: { ...block.styles, zIndex: layerActions[action] } });
    } else {
      toast({ title: 'Ação em desenvolvimento', description: 'Esta opção estará disponível em breve.' });
    }
    closeContextMenu();
  }, [clipboard, contextMenu, addBlock, updateBlock, activeSection, toast, closeContextMenu, canvasRef]);

  const handleExportPdf = useCallback(async () => {
    if (!canvasRef.current) return;
    const originalViewMode = viewMode; 
    setViewMode('desktop'); 
    toast({ title: "Gerando PDF...", description: "Isso pode levar alguns segundos." });
    await new Promise(resolve => setTimeout(resolve, 500)); 
    try {
      const canvasContainer = canvasRef.current;
      const sectionsToRender = Array.from(canvasContainer.children);
      const pdf = new jsPDF('p', 'px', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < sectionsToRender.length; i++) {
        const section = sectionsToRender[i];
        const canvas = await html2canvas(section, { scale: 2, useCORS: true, logging: false, allowTaint: true, windowWidth: section.scrollWidth, windowHeight: section.scrollHeight });
        const imgData = canvas.toDataURL('image/png');
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);
      }
      
      pdf.save(`${proposalName || 'proposta'}.pdf`);

    } catch (error) { 
      toast({ title: "Erro ao gerar PDF", description: error.message, variant: "destructive" }); 
    } finally { 
      setViewMode(originalViewMode); 
    }
  }, [canvasRef, viewMode, setViewMode, toast, proposalName]);

  const handleFileInputClick = useCallback(() => {
    if(fileInputRef.current) {
        fileInputRef.current.click();
    }
  }, []);

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
    handleContextMenuAction,
    handleExportPdf,
    fileInputRef,
    handleFileInputClick,
  };
};