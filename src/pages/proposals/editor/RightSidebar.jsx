import React, { useState } from 'react';
import { X, Settings, Type, Move, Grid3X3, PanelRightClose, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import GlobalStyleSettings from './sidebar/GlobalStyleSettings';
import BlockContentSettings from './sidebar/BlockContentSettings';
import BlockStyleSettings from './sidebar/BlockStyleSettings';
import BlockAdvancedSettings from './sidebar/BlockAdvancedSettings';
import SectionStyleSettings from './sidebar/SectionStyleSettings';
import LayersPanel from './sidebar/LayersPanel';

const blockTypeLabels = {
    text: "Texto",
    image: "Imagem",
    video: "Vídeo",
    button: "Botão",
    divider: "Divisor",
    spacer: "Espaçador",
    cover: "Capa",
    packages: "Pacotes",
    testimonial: "Depoimento",
    faq: "FAQ",
    cta: "Chamada à Ação",
    social: "Redes Sociais",
    section: "Seção",
};

const RightSidebar = ({ selectedBlock, updateBlock, setSelectedBlock, globalStyles, setGlobalStyles, showGrid, setShowGrid, proposal, setProposal, isAdmin, onToggle, onUploadComplete, viewMode }) => {
  const [activeTab, setActiveTab] = useState("style");

  // When a new block is selected, ensure the LayersPanel is visible if it's a section
  React.useEffect(() => {
    if (selectedBlock && selectedBlock.type === 'section') {
      setActiveTab(activeTab); // Keep current tab, or default to 'style'
    } else if (selectedBlock) {
      // For any other block type, default to 'style'
      setActiveTab('style');
    }
  }, [selectedBlock?.id]);

  const renderBlockSettings = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold capitalize">{blockTypeLabels[selectedBlock.type] || "Bloco"}</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
          <X size={16} />
        </Button>
      </div>

      <Tabs defaultValue="style" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content"><Type className="w-4 h-4 mr-1"/> Conteúdo</TabsTrigger>
            <TabsTrigger value="style"><Move className="w-4 h-4 mr-1"/> Estilo</TabsTrigger>
            <TabsTrigger value="advanced"><Settings className="w-4 h-4 mr-1"/> Avançado</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1 mt-4 -mr-4 pr-4">
            <TabsContent value="style" className="space-y-4">
                <BlockStyleSettings selectedBlock={selectedBlock} updateBlock={updateBlock} proposal={proposal} onUploadComplete={onUploadComplete} />
            </TabsContent>
            <TabsContent value="content" className="space-y-4">
                <BlockContentSettings selectedBlock={selectedBlock} updateBlock={updateBlock} isAdmin={isAdmin} proposalId={proposal.id} onUploadComplete={onUploadComplete}/>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4">
                <BlockAdvancedSettings selectedBlock={selectedBlock} updateBlock={updateBlock} />
            </TabsContent>
        </ScrollArea>
      </Tabs>
    </>
  );

  const renderSectionSettings = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold capitalize">Seção</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
          <X size={16} />
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="style"><Settings className="w-4 h-4 mr-1" /> Estilo</TabsTrigger>
            <TabsTrigger value="layers"><Layers className="w-4 h-4 mr-1" /> Camadas</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1 mt-4 -mr-4 pr-4">
            <TabsContent value="style" className="space-y-4">
                <SectionStyleSettings 
                    selectedSection={selectedBlock} 
                    setProposal={setProposal} 
                    proposal={proposal}
                    onUploadComplete={onUploadComplete}
                    viewMode={viewMode}
                />
            </TabsContent>
             <TabsContent value="layers" className="space-y-4">
                <LayersPanel 
                    sectionId={selectedBlock.id} 
                    proposal={proposal} 
                    setProposal={setProposal}
                    setSelectedBlock={setSelectedBlock}
                    selectedBlockId={selectedBlock.id}
                />
            </TabsContent>
        </ScrollArea>
      </Tabs>
    </>
  );
  
  const renderContent = () => {
      if (selectedBlock) {
          if (selectedBlock.type === 'section') {
              return renderSectionSettings();
          }
          return renderBlockSettings();
      }
      return null;
  };

  return (
    <motion.aside 
        key={selectedBlock ? selectedBlock.id : 'global'}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-80 bg-background border-l p-4 flex flex-col flex-shrink-0 z-40 shadow-lg"
    >
       {renderContent()}
    </motion.aside>
  );
};

export default RightSidebar;