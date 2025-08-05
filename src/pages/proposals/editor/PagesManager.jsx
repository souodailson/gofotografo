import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { useDrop, useDrag } from 'react-dnd';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';
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

const ItemTypes = {
    PAGE: 'page',
};

const PageThumbnail = ({ page, index, activePage, setActivePage, movePage, duplicatePage, deletePage }) => {
    const ref = React.useRef(null);

    const [{ handlerId }, drop] = useDrop({
        accept: ItemTypes.PAGE,
        collect: (monitor) => ({ handlerId: monitor.getHandlerId() }),
        hover: (item, monitor) => {
            if (!ref.current || item.index === index) return;
            movePage(item.index, index);
            item.index = index;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.PAGE,
        item: () => ({ id: page.id, index }),
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    drag(drop(ref));

    return (
        <div 
            ref={ref}
            data-handler-id={handlerId}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            className={cn(
                "relative group flex-shrink-0 w-32 h-40 border-2 bg-background cursor-pointer flex flex-col items-center justify-center transition-all",
                activePage === page.id ? "border-primary" : "border-border hover:border-primary/50"
            )}
            onClick={() => setActivePage(page.id)}
        >
            <span className="text-sm text-muted-foreground">Página {index + 1}</span>

            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); duplicatePage(page.id); }}><Copy size={12} /></Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}><Trash2 size={12} /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Excluir página?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a página e todo o seu conteúdo.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deletePage(page.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};


const PagesManager = ({ pages = [], activePage, setActivePage, setProposal }) => {

    const addPage = () => {
        setProposal(prev => {
            const newPage = { id: uuidv4(), name: `Página ${prev.pages.length + 1}` };
            return {
                ...prev,
                pages: [...prev.pages, newPage],
                blocksByPage: { ...prev.blocksByPage, [newPage.id]: [] }
            };
        });
    };
    
    const duplicatePage = (pageId) => {
        setProposal(prev => {
            const pageToDuplicate = prev.pages.find(p => p.id === pageId);
            const blocksToDuplicate = prev.blocksByPage[pageId] || [];
            
            if (!pageToDuplicate) return prev;

            const newPage = { ...pageToDuplicate, id: uuidv4() };
            const newBlocks = cloneDeep(blocksToDuplicate).map(b => ({...b, id: uuidv4()}));

            const pageIndex = prev.pages.findIndex(p => p.id === pageId);
            const newPages = [...prev.pages];
            newPages.splice(pageIndex + 1, 0, newPage);

            return {
                ...prev,
                pages: newPages,
                blocksByPage: { ...prev.blocksByPage, [newPage.id]: newBlocks }
            };
        });
    };

    const deletePage = (pageId) => {
        if (pages.length <= 1) return; // Cannot delete the last page
        setProposal(prev => {
            const newPages = prev.pages.filter(p => p.id !== pageId);
            const newBlocksByPage = { ...prev.blocksByPage };
            delete newBlocksByPage[pageId];

            if (activePage === pageId) {
                setActivePage(newPages[0]?.id || null);
            }

            return {
                ...prev,
                pages: newPages,
                blocksByPage: newBlocksByPage,
            };
        });
    };

    const movePage = (fromIndex, toIndex) => {
        setProposal(prev => {
            const newPages = [...prev.pages];
            const [moved] = newPages.splice(fromIndex, 1);
            newPages.splice(toIndex, 0, moved);
            return { ...prev, pages: newPages };
        });
    };

    return (
        <div className="bg-background border-t p-2 flex items-center gap-4 w-full overflow-x-auto">
            {pages.map((page, index) => (
                <PageThumbnail
                    key={page.id}
                    page={page}
                    index={index}
                    activePage={activePage}
                    setActivePage={setActivePage}
                    movePage={movePage}
                    duplicatePage={duplicatePage}
                    deletePage={deletePage}
                />
            ))}
            <Button variant="outline" className="flex-shrink-0" onClick={addPage}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Página
            </Button>
        </div>
    );
};

export default PagesManager;