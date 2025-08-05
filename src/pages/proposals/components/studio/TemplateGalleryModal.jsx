import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, GraduationCap, HeartHandshake, Baby, Cake, Camera, BookOpen } from 'lucide-react';

const TemplateGalleryModal = ({ isOpen, onOpenChange, templates, onUseTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getIconForTemplate = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('casamento') || lowerTitle.includes('noivos')) {
      return <HeartHandshake className="w-5 h-5 text-primary flex-shrink-0" />;
    }
    if (lowerTitle.includes('formatura')) {
      return <GraduationCap className="w-5 h-5 text-primary flex-shrink-0" />;
    }
    if (lowerTitle.includes('parto') || lowerTitle.includes('nascimento') || lowerTitle.includes('newborn')) {
      return <Baby className="w-5 h-5 text-primary flex-shrink-0" />;
    }
    if (lowerTitle.includes('aniversário') || lowerTitle.includes('festa')) {
      return <Cake className="w-5 h-5 text-primary flex-shrink-0" />;
    }
    if (lowerTitle.includes('ensaio')) {
      return <Camera className="w-5 h-5 text-primary flex-shrink-0" />;
    }
    return <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />;
  };

  const filteredTemplates = templates.filter(template => 
    template.nome_modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Galeria de Modelos de Contrato</DialogTitle>
          <DialogDescription>Escolha um modelo para começar. Você poderá editá-lo completamente.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome ou nicho..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="flex-grow pr-4 -mr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {filteredTemplates.map(template => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200 flex flex-col"
                onClick={() => onUseTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-start gap-2">
                    {getIconForTemplate(template.nome_modelo)}
                    <span className="flex-1">{template.nome_modelo}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-xs text-muted-foreground line-clamp-3">{template.description || "Este modelo não possui uma descrição."}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateGalleryModal;