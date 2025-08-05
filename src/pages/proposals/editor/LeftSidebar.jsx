import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes, createDragItem as createImageDragItem } from './ItemTypes';
import { useToast } from '@/components/ui/use-toast';
import { cloneDeep } from 'lodash';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Pilcrow, PanelLeftClose, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useData } from '@/contexts/DataContext';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { availableBlocks, textBlockOptions, elementBlocks } from '../proposalConstants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Trash2 } from 'lucide-react';
import { sanitizeFilename } from '@/lib/utils';

const SidebarItem = ({ block, onAddBlock, activeSection }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.BLOCK,
    item: () => cloneDeep(block),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleClick = (e) => {
    e.preventDefault();
    const position = { x: '20%', y: '20%' };
    onAddBlock(block, activeSection, position);
  };

  return (
    <div
      ref={drag}
      className="flex items-center gap-3 p-2 rounded-md border bg-background hover:bg-muted cursor-grab transition-all"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter') handleClick(e); }}
      role="button"
      tabIndex={0}
      title={`Clique para adicionar ou arraste para a posição desejada.`}
    >
      {block.icon || <Pilcrow size={18} />}
      <span className="text-sm font-medium">{block.label}</span>
    </div>
  );
};

const UploadsTab = ({ uploads, loading, proposalId, onUploadComplete, isNew, handleSave, onAddBlock, activeSection }) => {
  const fileInputRef = React.useRef(null);
  const { user } = useData();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;

    let currentProposalId = proposalId;
    if (isNew && !currentProposalId) {
        try {
            toast({ title: "Salvando rascunho...", description: "É preciso salvar a proposta para fazer uploads." });
            const savedProposal = await handleSave();
            if (savedProposal && savedProposal.id) {
                currentProposalId = savedProposal.id;
            } else {
                toast({ title: "Falha ao salvar", description: "Não foi possível salvar a proposta para o upload.", variant: "destructive" });
                return;
            }
        } catch (error) {
             toast({ title: "Erro ao salvar", description: "Ocorreu um erro ao salvar a proposta.", variant: "destructive" });
             return;
        }
    }
    
    setIsUploading(true);
    toast({ title: 'Enviando arquivos...', description: `Enviando ${files.length} arquivo(s).` });
    
    const validFiles = Array.from(files).filter(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast({ title: "Arquivo muito grande", description: `O arquivo ${file.name} excede o limite de 10MB e não será enviado.`, variant: "destructive" });
            return false;
        }
        return true;
    });

    if (validFiles.length === 0) {
        setIsUploading(false);
        return;
    }

    const uploadPromises = validFiles.map(file => {
        const sanitizedName = sanitizeFilename(file.name);
        const filePath = `${user.id}/${currentProposalId}/${uuidv4()}-${sanitizedName}`;
        return supabase.storage.from('propostas').upload(filePath, file);
    });

    const results = await Promise.all(uploadPromises);
    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
        toast({ title: 'Erro no Upload', description: `Falha ao enviar ${errors.length} arquivo(s). ${errors[0].error.message}`, variant: 'destructive' });
    }

    if (errors.length < validFiles.length) {
      toast({ title: 'Upload Concluído!', description: `${validFiles.length - errors.length} arquivo(s) enviado(s) com sucesso.`});
      onUploadComplete();
    }
    
    setIsUploading(false);
  };
  
  const DraggableImage = ({ imageUrl }) => {
      const [{ isDragging: isImageDragging }, dragImage] = useDrag(() => ({
          type: ItemTypes.IMAGE_UPLOAD,
          item: () => createImageDragItem(imageUrl),
          collect: (monitor) => ({
              isImageDragging: monitor.isDragging(),
          }),
      }));

      const handleDelete = async (e) => {
        e.stopPropagation();
        const path = new URL(imageUrl).pathname.split('/propostas/')[1];
        const { error } = await supabase.storage.from('propostas').remove([path]);
        if(error) {
            toast({ title: "Erro ao deletar imagem", description: error.message, variant: 'destructive' });
        } else {
            toast({ title: "Imagem deletada com sucesso!" });
            onUploadComplete();
        }
      }
      
      const handleClick = () => {
        const imageBlock = JSON.parse(createImageDragItem(imageUrl).data);
        const position = { x: '20%', y: '20%' };
        onAddBlock(imageBlock, activeSection, position);
      }

      return (
          <div 
              ref={dragImage} 
              className="relative group cursor-grab" 
              style={{ opacity: isImageDragging ? 0.5 : 1 }}
          >
              <div onClick={handleClick} className="w-full h-full">
                <img src={imageUrl} alt="Upload" className="w-full h-auto object-cover rounded-md aspect-square" />
              </div>
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <Trash2 size={12} />
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Imagem?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A imagem será removida permanentemente do seu armazenamento.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full">
      <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Enviando...' : 'Fazer Upload (Max 10MB)'}
      </Button>
      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} accept="image/*,application/pdf" />

      <ScrollArea className="mt-4 flex-1">
        <div className="grid grid-cols-2 gap-2 pr-2">
            {loading && <p>Carregando...</p>}
            {uploads.map((url) => (
              <DraggableImage key={url} imageUrl={url} />
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};


const LeftSidebar = ({ onAddBlock, activeSection, uploads, loadingUploads, onUploadComplete, proposalId, isNew, handleSave, onToggle }) => {
  return (
    <motion.aside 
        initial={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-72 bg-background border-r p-0 flex flex-col flex-shrink-0 studio-sidebar"
    >
        <div className="flex items-center justify-between p-2 border-b">
            <h3 className="font-semibold text-lg ml-2">Adicionar</h3>
            <Button variant="ghost" size="icon" onClick={onToggle}>
                <PanelLeftClose />
            </Button>
        </div>
        <Tabs defaultValue="add" className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none">
                <TabsTrigger value="add"><PlusCircle className="w-4 h-4 mr-2"/> Adicionar</TabsTrigger>
                <TabsTrigger value="uploads"><Upload className="w-4 h-4 mr-2"/> Uploads</TabsTrigger>
            </TabsList>
            <TabsContent value="add" className="flex-1 overflow-hidden p-4">
                 <ScrollArea className="h-full pr-4 -mr-4">
                    <Accordion type="multiple" defaultValue={['text', 'media']} className="w-full">
                        <AccordionItem value="text">
                            <AccordionTrigger className="font-semibold text-sm">Texto</AccordionTrigger>
                            <AccordionContent className="pt-2 space-y-2">
                                {textBlockOptions.map((block) => (
                                    <SidebarItem key={block.label} block={block} onAddBlock={onAddBlock} activeSection={activeSection} />
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="media">
                            <AccordionTrigger className="font-semibold text-sm">Mídia & Conteúdo</AccordionTrigger>
                            <AccordionContent className="pt-2 space-y-2">
                                {availableBlocks.map((block) => (
                                    <SidebarItem key={block.type} block={block} onAddBlock={onAddBlock} activeSection={activeSection} />
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="elements">
                            <AccordionTrigger className="font-semibold text-sm">Formas & Elementos</AccordionTrigger>
                            <AccordionContent className="pt-2 space-y-2">
                                {elementBlocks.map((block) => (
                                    <SidebarItem key={block.label} block={block} onAddBlock={onAddBlock} activeSection={activeSection} />
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </ScrollArea>
            </TabsContent>
            <TabsContent value="uploads" className="flex-1 overflow-hidden p-4">
                <UploadsTab 
                  uploads={uploads} 
                  loading={loadingUploads} 
                  onUploadComplete={onUploadComplete} 
                  proposalId={proposalId}
                  isNew={isNew}
                  handleSave={handleSave}
                  onAddBlock={onAddBlock}
                  activeSection={activeSection}
                />
            </TabsContent>
        </Tabs>
    </motion.aside>
  );
};

export default LeftSidebar;