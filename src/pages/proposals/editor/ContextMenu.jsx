import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  ClipboardPaste,
  CopyPlus,
  Trash2,
  Lock,
  Unlock,
  ChevronsUp,
  ChevronsDown,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Upload,
  FileX2,
} from 'lucide-react';

const ContextMenuItem = ({ children, onClick, disabled = false, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-3 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const ContextMenuSubMenu = ({ children, label, icon }) => {
  return (
    <div className="relative group">
      <div className="w-full text-left px-3 py-1.5 text-sm flex items-center justify-between gap-3 rounded-md hover:bg-muted">
        <div className="flex items-center gap-3">
            {icon}
            <span>{label}</span>
        </div>
        <ChevronRight size={14} />
      </div>
      <div className="absolute left-full top-0 ml-1 w-48 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg p-1 invisible group-hover:visible">
        {children}
      </div>
    </div>
  );
};


const ContextMenu = ({ x, y, block, onClose, onAction, onFileInputClick }) => {
  const menuRef = useRef(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('resize', handleResize);
    };
  }, [onClose]);

  const menuStyle = {
    top: y,
    left: x,
  };
  
  // Adjust position if menu overflows
  if (menuRef.current) {
    const menuRect = menuRef.current.getBoundingClientRect();
    if (x + menuRect.width > windowSize.width) {
        menuStyle.left = x - menuRect.width;
    }
    if (y + menuRect.height > windowSize.height) {
        menuStyle.top = y - menuRect.height;
    }
  }

  const isSection = block.type === 'section';
  const isPdf = block.type === 'pdf';

  const renderGenericMenu = () => (
      <>
        <ContextMenuItem onClick={() => onAction('copy', block)}>
            <Copy size={14} /> Copiar
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction('paste', block)}>
            <ClipboardPaste size={14} /> Colar
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction('duplicate', block)}>
            <CopyPlus size={14} /> Duplicar
        </ContextMenuItem>
        <div className="my-1 border-t border-border/50"></div>
        
        {!isSection && (
            <ContextMenuSubMenu label="Camada" icon={<ChevronsUp size={14} />}>
                <ContextMenuItem onClick={() => onAction('layer_top', block)}>
                    <ChevronsUp size={14} /> Trazer para o Topo
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onAction('layer_front', block)}>
                    <ChevronUp size={14} /> Trazer para Frente
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onAction('layer_back', block)}>
                    <ChevronDown size={14} /> Enviar para Trás
                </ContextMenuItem>
                 <ContextMenuItem onClick={() => onAction('layer_bottom', block)}>
                    <ChevronsDown size={14} /> Enviar para o Fundo
                </ContextMenuItem>
            </ContextMenuSubMenu>
        )}
        
        {!isSection && (
            <ContextMenuItem onClick={() => onAction('toggleLock', block)}>
                {block.locked ? <Unlock size={14} /> : <Lock size={14} />}
                {block.locked ? 'Desbloquear' : 'Bloquear'}
            </ContextMenuItem>
        )}

        <div className="my-1 border-t border-border/50"></div>
        <ContextMenuItem onClick={() => onAction('delete', block)} className="text-destructive">
            <Trash2 size={14} /> Excluir
        </ContextMenuItem>
      </>
  );

  const renderPdfMenu = () => (
      <>
        <ContextMenuItem onClick={() => onFileInputClick()}>
            <Upload size={14} /> Upload/Alterar PDF
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction('remove_pdf_src', block)} disabled={!block.content.src}>
            <FileX2 size={14} /> Remover PDF
        </ContextMenuItem>
        <div className="my-1 border-t border-border/50"></div>
        <ContextMenuSubMenu label="Camada" icon={<ChevronsUp size={14} />}>
            <ContextMenuItem onClick={() => onAction('layer_front', block)}>
                <ChevronUp size={14} /> Trazer para Frente
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAction('layer_back', block)}>
                <ChevronDown size={14} /> Enviar para Trás
            </ContextMenuItem>
        </ContextMenuSubMenu>
        <div className="my-1 border-t border-border/50"></div>
        <ContextMenuItem onClick={() => onAction('duplicate', block)}>
            <CopyPlus size={14} /> Duplicar Elemento
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction('delete', block)} className="text-destructive">
            <Trash2 size={14} /> Excluir Elemento
        </ContextMenuItem>
      </>
  );

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      style={menuStyle}
      className="fixed z-[99999] w-56 bg-background/80 backdrop-blur-sm border rounded-lg shadow-xl p-1.5"
    >
        {isPdf ? renderPdfMenu() : renderGenericMenu()}
    </motion.div>
  );
};

export default ContextMenu;