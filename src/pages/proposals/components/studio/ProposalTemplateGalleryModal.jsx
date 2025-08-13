import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, GraduationCap, HeartHandshake, Baby, Cake, Camera, BookOpen, Eye, Palette, Sparkles } from 'lucide-react';

const ProposalTemplateGalleryModal = ({ isOpen, onOpenChange, templates, onUseTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Todos', icon: BookOpen },
    { id: 'casamento', label: 'Casamento', icon: HeartHandshake },
    { id: 'formatura', label: 'Formatura', icon: GraduationCap },
    { id: 'newborn', label: 'Newborn', icon: Baby },
    { id: 'aniversario', label: 'Aniversário', icon: Cake },
    { id: 'ensaio', label: 'Ensaio', icon: Camera },
  ];

  const getIconForTemplate = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('casamento') || lowerTitle.includes('noivos')) {
      return <HeartHandshake className="w-5 h-5 text-rose-500 flex-shrink-0" />;
    }
    if (lowerTitle.includes('formatura')) {
      return <GraduationCap className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    }
    if (lowerTitle.includes('parto') || lowerTitle.includes('nascimento') || lowerTitle.includes('newborn')) {
      return <Baby className="w-5 h-5 text-pink-500 flex-shrink-0" />;
    }
    if (lowerTitle.includes('aniversário') || lowerTitle.includes('festa')) {
      return <Cake className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
    }
    if (lowerTitle.includes('ensaio')) {
      return <Camera className="w-5 h-5 text-purple-500 flex-shrink-0" />;
    }
    return <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />;
  };

  const getTemplateCategory = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('casamento') || lowerTitle.includes('noivos')) return 'casamento';
    if (lowerTitle.includes('formatura')) return 'formatura';
    if (lowerTitle.includes('parto') || lowerTitle.includes('nascimento') || lowerTitle.includes('newborn')) return 'newborn';
    if (lowerTitle.includes('aniversário') || lowerTitle.includes('festa')) return 'aniversario';
    if (lowerTitle.includes('ensaio')) return 'ensaio';
    return 'outros';
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || getTemplateCategory(template.nome) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePreview = (template, e) => {
    e.stopPropagation();
    // TODO: Implementar preview em modal separado
    console.log('Preview template:', template);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Galeria de Templates de Propostas
          </DialogTitle>
          <DialogDescription>
            Escolha um template profissional para começar sua proposta. Você poderá personalizar completamente.
          </DialogDescription>
        </DialogHeader>

        {/* Filtros */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar templates por nome ou descrição..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Categorias */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-1"
                >
                  <IconComponent className="w-4 h-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Grid de Templates */}
        <ScrollArea className="flex-grow pr-4 -mr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4">
            {filteredTemplates.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhum template encontrado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tente ajustar os filtros ou busque por outros termos.
                </p>
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:shadow-lg hover:border-primary hover:scale-105 transition-all duration-300 flex flex-col group relative overflow-hidden"
                  onClick={() => onUseTemplate(template)}
                >
                  {/* Badge da categoria */}
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                      {getTemplateCategory(template.nome) === 'outros' ? 'Geral' : categories.find(c => c.id === getTemplateCategory(template.nome))?.label}
                    </Badge>
                  </div>

                  {/* Botão de preview */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
                    onClick={(e) => handlePreview(template, e)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  {/* Preview da proposta (se houver imagem) */}
                  <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                    {template.preview_image ? (
                      <img 
                        src={template.preview_image} 
                        alt={`Preview do template ${template.nome}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Palette className="w-8 h-8 text-primary/50 mx-auto mb-2" />
                        <span className="text-xs text-muted-foreground">Preview</span>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-start gap-2">
                      {getIconForTemplate(template.nome)}
                      <span className="flex-1 line-clamp-2">{template.nome}</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {template.descricao || "Este template não possui uma descrição."}
                    </p>
                    
                    {/* Info adicional */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">
                        Por GO.FOTÓGRAFO
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Profissional
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalTemplateGalleryModal;