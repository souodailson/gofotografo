import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, UploadCloud, Image as ImageIcon, Film, Grid, Square, Copy, AlignLeft as AlignTop, AlignCenter, PanelBottom as AlignBottom, Circle, CornerUpLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { sanitizeFilename } from '@/lib/utils';

const SectionEditor = ({ section, updateSection, removeSection, duplicateSection, servicePackages, proposalId, autoSave, isAdmin }) => {
  const { user } = useData();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFieldChange = (field, value) => {
    updateSection(section.id, { ...section, [field]: value });
  };

  const handleItemChange = (itemId, field, value) => {
    const updatedItems = section.items.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    );
    updateSection(section.id, { ...section, items: updatedItems });
  };

  const addItem = () => {
    let newItem;
    switch (section.type) {
      case 'packages':
        newItem = { id: uuidv4(), title: 'Novo Pacote', text: 'Descrição do pacote', price: '0.00' };
        break;
      case 'testimonials':
        newItem = { id: uuidv4(), author: 'Novo Autor', text: 'Depoimento...', photo: '' };
        break;
      case 'faq':
        newItem = { id: uuidv4(), q: 'Nova Pergunta?', a: 'Resposta...' };
        break;
      case 'differentiators':
        newItem = { id: uuidv4(), title: 'Novo Diferencial', text: 'Descrição...', image: '' };
        break;
      case 'finalCta':
        newItem = { id: uuidv4(), text: 'Novo Botão', link: '' };
        updateSection(section.id, { ...section, buttons: [...(section.buttons || []), newItem] });
        return;
      default:
        newItem = { id: uuidv4() };
    }
    updateSection(section.id, { ...section, items: [...(section.items || []), newItem] });
  };

  const removeItem = (itemId) => {
    const updatedItems = section.items.filter(item => item.id !== itemId);
    updateSection(section.id, { ...section, items: updatedItems });
  };

  const removeButtonItem = (buttonId) => {
    const updatedButtons = section.buttons.filter(btn => btn.id !== buttonId);
    updateSection(section.id, { ...section, buttons: updatedButtons });
  };

  const handleButtonChange = (buttonId, field, value) => {
    const updatedButtons = section.buttons.map(btn =>
      btn.id === buttonId ? { ...btn, [field]: value } : btn
    );
    updateSection(section.id, { ...section, buttons: updatedButtons });
  };

  const addPackageFromSystem = (packageId) => {
    const pkg = (servicePackages || []).find(p => p.id === packageId);
    if (pkg) {
      const newPackageItem = {
        id: uuidv4(),
        title: pkg.name,
        text: pkg.description,
        price: pkg.price_cash_pix,
        isFromSystem: true,
        systemPackageId: pkg.id
      };
      updateSection(section.id, { ...section, items: [...(section.items || []), newPackageItem] });
    }
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let currentProposalId = proposalId;

    if (!currentProposalId) {
        try {
            toast({ title: "Salvando rascunho...", description: "Estamos salvando sua proposta para poder enviar as imagens." });
            const savedProposal = await autoSave(true);
            currentProposalId = savedProposal.id;
        } catch (error) {
            toast({ title: "Falha ao salvar rascunho", description: "Não foi possível salvar a proposta para o upload.", variant: "destructive" });
            return;
        }
    }


    setIsUploading(true);
    const uploadedUrls = [];
    const bucketName = isAdmin ? 'proposal_templates_assets' : 'propostas';

    for (const file of files) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ title: "Arquivo muito grande", description: `O arquivo ${file.name} excede o limite de 5MB.`, variant: "destructive" });
            continue;
        }

        const fileName = `${uuidv4()}-${sanitizeFilename(file.name)}`;
        const filePath = `${user.id}/${currentProposalId}/${section.id}/${fileName}`;

        const { error } = await supabase.storage.from(bucketName).upload(filePath, file);

        if (error) {
            toast({ title: "Erro no upload", description: `Falha ao enviar ${file.name}: ${error.message}`, variant: "destructive" });
        } else {
            const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
            uploadedUrls.push(publicUrl);
        }
    }

    if (uploadedUrls.length > 0) {
        updateSection(section.id, { ...section, images: [...(section.images || []), ...uploadedUrls] });
        toast({ title: "Upload concluído!", description: `${uploadedUrls.length} imagem(ns) adicionada(s).` });
    }
    setIsUploading(false);
  };

  const removeImage = (imageUrl) => {
    const updatedImages = section.images.filter(img => img !== imageUrl);
    updateSection(section.id, { ...section, images: updatedImages });
  };

  const renderImageManager = () => {
    if (section.type === 'socials') return null;
    return (
        <div className="mt-4 p-4 border-t">
            <h4 className="font-semibold text-sm mb-2">Imagens da Seção</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4">
                {(section.images || []).map(img => (
                    <div key={img} className="relative group aspect-square">
                        <img src={img} alt="Preview" className="w-full h-full object-cover rounded-md" />
                        <button onClick={() => removeImage(img)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                <label className="flex flex-col items-center justify-center w-full h-full aspect-square border-2 border-dashed rounded-md cursor-pointer hover:bg-muted">
                    <UploadCloud className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1 text-center">Adicionar</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
            </div>
            {isUploading && <p className="text-sm text-muted-foreground">Enviando imagens...</p>}
            
            <div className="flex items-center gap-4">
                <Label className="text-sm">Layout:</Label>
                <div className="flex items-center gap-2">
                    <Button variant={section.imageLayout === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleFieldChange('imageLayout', 'grid')}><Grid className="w-4 h-4" /></Button>
                    <Button variant={section.imageLayout === 'carousel' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleFieldChange('imageLayout', 'carousel')}><Film className="w-4 h-4" /></Button>
                    <Button variant={section.imageLayout === 'mosaic' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleFieldChange('imageLayout', 'mosaic')}><ImageIcon className="w-4 h-4" /></Button>
                    <Button variant={section.imageLayout === 'background' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleFieldChange('imageLayout', 'background')}><Square className="w-4 h-4" /></Button>
                </div>
            </div>
        </div>
    );
  };

  const renderAboutImageOptions = () => {
    if (section.type !== 'about') return null;
    return (
      <div className="mt-4 p-4 border-t">
        <h4 className="font-semibold text-sm mb-2">Layout da Foto de Perfil</h4>
        <div className="flex items-center gap-4">
            <Label className="text-sm">Posição:</Label>
            <div className="flex items-center gap-2">
                <Button variant={section.profileImagePosition === 'top' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleFieldChange('profileImagePosition', 'top')}><AlignTop className="w-4 h-4" /></Button>
                <Button variant={section.profileImagePosition === 'left' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleFieldChange('profileImagePosition', 'left')}><CornerUpLeft className="w-4 h-4" /></Button>
                <Button variant={section.profileImagePosition === 'bottom' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleFieldChange('profileImagePosition', 'bottom')}><AlignBottom className="w-4 h-4" /></Button>
            </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
            <Label className="text-sm">Formato:</Label>
            <div className="flex items-center gap-2">
                <Button variant={section.profileImageShape === 'circle' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleFieldChange('profileImageShape', 'circle')}><Circle className="w-4 h-4" /></Button>
                <Button variant={section.profileImageShape === 'square' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleFieldChange('profileImageShape', 'square')}><Square className="w-4 h-4" /></Button>
            </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (section.type) {
      case 'cover':
        return (
          <div>
            <Label>Imagem de Fundo</Label>
            <p className="text-xs text-muted-foreground mb-2">Adicione uma imagem de fundo para a capa.</p>
            {renderImageManager()}
          </div>
        );
      case 'about':
      case 'studio':
      case 'howItWorks':
        return (
          <>
            <Textarea value={section.content || ''} onChange={(e) => handleFieldChange('content', e.target.value)} placeholder="Escreva o conteúdo desta seção..." />
            {renderAboutImageOptions()}
          </>
        );
      
      case 'packages':
        return (
          <div className="space-y-4">
            {!isAdmin && (
              <Select onValueChange={addPackageFromSystem}>
                <SelectTrigger><SelectValue placeholder="Adicionar pacote do sistema..." /></SelectTrigger>
                <SelectContent>
                  {(servicePackages || []).map(pkg => <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {(section.items || []).map(item => (
              <Card key={item.id}>
                <CardContent className="p-4 space-y-2">
                  <Input placeholder="Título do Pacote" value={item.title} onChange={(e) => handleItemChange(item.id, 'title', e.target.value)} />
                  <Textarea placeholder="Descrição" value={item.text} onChange={(e) => handleItemChange(item.id, 'text', e.target.value)} />
                  <Input placeholder="Preço" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} />
                  <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>Remover</Button>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addItem}>Adicionar Pacote Manual</Button>
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-4">
            {(section.items || []).map(item => (
              <Card key={item.id}>
                <CardContent className="p-4 space-y-2">
                  <Input placeholder="Autor" value={item.author} onChange={(e) => handleItemChange(item.id, 'author', e.target.value)} />
                  <Textarea placeholder="Depoimento" value={item.text} onChange={(e) => handleItemChange(item.id, 'text', e.target.value)} />
                  <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>Remover</Button>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addItem}>Adicionar Depoimento</Button>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            {(section.items || []).map(item => (
              <Card key={item.id}>
                <CardContent className="p-4 space-y-2">
                  <Input placeholder="Pergunta" value={item.q} onChange={(e) => handleItemChange(item.id, 'q', e.target.value)} />
                  <Textarea placeholder="Resposta" value={item.a} onChange={(e) => handleItemChange(item.id, 'a', e.target.value)} />
                  <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>Remover</Button>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addItem}>Adicionar Pergunta</Button>
          </div>
        );
      
      case 'differentiators':
        return (
          <div className="space-y-4">
            {(section.items || []).map(item => (
              <Card key={item.id}>
                <CardContent className="p-4 space-y-2">
                  <Input placeholder="Título do Diferencial" value={item.title} onChange={(e) => handleItemChange(item.id, 'title', e.target.value)} />
                  <Textarea placeholder="Descrição" value={item.text} onChange={(e) => handleItemChange(item.id, 'text', e.target.value)} />
                  <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>Remover</Button>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addItem}>Adicionar Diferencial</Button>
          </div>
        );

      case 'finalCta':
        return (
          <div className="space-y-4">
            {(section.buttons || []).map(btn => (
              <Card key={btn.id}>
                <CardContent className="p-4 space-y-2">
                  <Input placeholder="Texto do Botão" value={btn.text} onChange={(e) => handleButtonChange(btn.id, 'text', e.target.value)} />
                  <Input placeholder="Link (URL)" value={btn.link} onChange={(e) => handleButtonChange(btn.id, 'link', e.target.value)} />
                  <Button variant="destructive" size="sm" onClick={() => removeButtonItem(btn.id)}>Remover Botão</Button>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addItem}>Adicionar Botão</Button>
          </div>
        );

      case 'socials':
        return (
          <div className="space-y-2">
            <Input placeholder="Instagram (@usuario)" value={section.instagram || ''} onChange={(e) => handleFieldChange('instagram', e.target.value)} />
            <Input placeholder="Website (https://...)" value={section.website || ''} onChange={(e) => handleFieldChange('website', e.target.value)} />
            <Input placeholder="WhatsApp (número com DDD)" value={section.whatsapp || ''} onChange={(e) => handleFieldChange('whatsapp', e.target.value)} />
          </div>
        );

      default:
        return <p className="text-sm text-muted-foreground">Tipo de seção não reconhecido.</p>;
    }
  };

  const isCover = section.type === 'cover';

  return (
    <Card className={`mb-4 ${!isCover ? 'pl-10' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-base font-medium">{section.title}</CardTitle>
        <div className="flex items-center gap-1">
          {!isCover && (
            <Button variant="ghost" size="icon" onClick={() => duplicateSection(section.id)}>
              <Copy className="h-4 w-4" />
            </Button>
          )}
          {!isCover && (
            <Button variant="ghost" size="icon" onClick={() => removeSection(section.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isCover && <Input className="mb-4 font-semibold" value={section.title} onChange={(e) => handleFieldChange('title', e.target.value)} />}
        {renderContent()}
        {!isCover && renderImageManager()}
      </CardContent>
    </Card>
  );
};

export default SectionEditor;