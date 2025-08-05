import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Copy, Trash2, ChevronsUp, Image as ImageIcon } from 'lucide-react';
import { useDrop, useDrag } from 'react-dnd';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';
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
    SECTION: 'section',
};

const SectionThumbnail = ({ section, index, activeSection, setActiveSection, moveSection, duplicateSection, deleteSection, blocks }) => {
    const ref = React.useRef(null);

    const [{ handlerId }, drop] = useDrop({
        accept: ItemTypes.SECTION,
        collect: (monitor) => ({ handlerId: monitor.getHandlerId() }),
        hover: (item, monitor) => {
            if (!ref.current || item.index === index) return;
            moveSection(item.index, index);
            item.index = index;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.SECTION,
        item: () => ({ id: section.id, index }),
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    drag(drop(ref));

    const hasBackgroundImage = !!section.styles?.backgroundImage;
    const hasContent = blocks && blocks.length > 0;

    const renderPreview = () => {
        if (hasBackgroundImage) {
            return <img src={section.styles.backgroundImage} alt={`Preview da Seção ${index + 1}`} className="w-full h-full object-cover" />;
        }
        if (hasContent) {
            // This is a simplified preview. For a real "screenshot", html2canvas is needed,
            // but it can be performance-intensive for many thumbnails. This is a lighter alternative.
            return (
                <div style={{ backgroundColor: section.styles?.backgroundColor || '#FFFFFF', filter: 'blur(2px)' }} className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
                </div>
            );
        }
        return (
            <div style={{ backgroundColor: section.styles?.backgroundColor || '#FFFFFF', filter: 'blur(2px)' }} className="w-full h-full" />
        );
    }

    return (
        <div 
            ref={ref}
            data-handler-id={handlerId}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            className={cn(
                "relative group flex-shrink-0 w-28 h-36 border-2 bg-background cursor-pointer flex flex-col items-center justify-center transition-all overflow-hidden",
                activeSection === section.id ? "border-primary" : "border-border hover:border-primary/50"
            )}
            onClick={() => setActiveSection(section.id)}
        >
            {renderPreview()}
            <div className="absolute inset-0 bg-black/10"></div>
            <span className="relative text-xs text-white font-bold z-10 bg-black/50 px-2 py-1 rounded">Seção {index + 1}</span>

            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 z-20">
                <Button variant="ghost" size="icon" className="h-6 w-6 bg-white/80 hover:bg-white" onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }}><Copy size={12} /></Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}><Trash2 size={12} /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Excluir seção?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a seção e todo o seu conteúdo.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteSection(section.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};


const SectionsManager = ({ sections = [], activeSection, setActiveSection, setProposal, proposal }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const addSection = () => {
        setProposal(prev => {
            const newSection = { id: uuidv4(), name: `Seção ${prev.sections.length + 1}`, styles: {} };
            return {
                ...prev,
                sections: [...prev.sections, newSection],
                blocksBySection: { ...prev.blocksBySection, [newSection.id]: [] },
            };
        });
    };
    
    const duplicateSection = (sectionId) => {
        setProposal(prev => {
            const sectionToDuplicate = prev.sections.find(p => p.id === sectionId);
            const blocksToDuplicate = prev.blocksBySection[sectionId] || [];
            
            if (!sectionToDuplicate) return prev;

            const newSection = { ...cloneDeep(sectionToDuplicate), id: uuidv4() };
            const newBlocks = cloneDeep(blocksToDuplicate).map(b => ({...b, id: uuidv4()}));

            const sectionIndex = prev.sections.findIndex(p => p.id === sectionId);
            const newSections = [...prev.sections];
            newSections.splice(sectionIndex + 1, 0, newSection);

            return {
                ...prev,
                sections: newSections,
                blocksBySection: { ...prev.blocksBySection, [newSection.id]: newBlocks }
            };
        });
    };

    const deleteSection = (sectionId) => {
        if (sections.length <= 1) return; // Cannot delete the last section
        setProposal(prev => {
            const newSections = prev.sections.filter(p => p.id !== sectionId);
            const newBlocksBySection = { ...prev.blocksBySection };
            delete newBlocksBySection[sectionId];

            if (activeSection === sectionId) {
                setActiveSection(newSections[0]?.id || null);
            }

            return {
                ...prev,
                sections: newSections,
                blocksBySection: newBlocksBySection,
            };
        });
    };

    const moveSection = (fromIndex, toIndex) => {
        setProposal(prev => {
            const newSections = [...prev.sections];
            const [moved] = newSections.splice(fromIndex, 1);
            newSections.splice(toIndex, 0, moved);
            return { ...prev, sections: newSections };
        });
    };

    return (
        <motion.div 
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50"
            onHoverStart={() => setIsExpanded(true)}
            onHoverEnd={() => setIsExpanded(false)}
        >
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="bg-background/80 backdrop-blur-sm border-t border-x rounded-t-lg p-2 flex items-center gap-4 w-auto max-w-[90vw] overflow-x-auto"
                    >
                        {sections.map((section, index) => (
                            <SectionThumbnail
                                key={section.id}
                                section={section}
                                index={index}
                                activeSection={activeSection}
                                setActiveSection={setActiveSection}
                                moveSection={moveSection}
                                duplicateSection={duplicateSection}
                                deleteSection={deleteSection}
                                blocks={proposal.blocksBySection[section.id] || []}
                            />
                        ))}
                        <Button variant="outline" className="flex-shrink-0" onClick={addSection}>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Seção
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <motion.div
                initial={false}
                animate={{ y: isExpanded ? 20 : 0, opacity: isExpanded ? 0 : 1 }}
                className="bg-background/80 backdrop-blur-sm border-t border-x rounded-t-lg p-1 flex items-center gap-2"
            >
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(true)}>
                    <ChevronsUp className="h-4 w-4 mr-2" />
                    Seções ({sections.length})
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={addSection}>
                    <Plus className="h-4 w-4" />
                </Button>
            </motion.div>
        </motion.div>
    );
};

export default SectionsManager;