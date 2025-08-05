import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle, Instagram, Facebook, Link as LinkIcon, Youtube, Twitter, Linkedin, MessageSquare as WhatsApp, Image as Pinterest, Upload } from 'lucide-react';


const socialPlatforms = [
    { value: 'instagram', label: 'Instagram', icon: <Instagram size={16} />, baseUrl: 'https://instagram.com/' },
    { value: 'facebook', label: 'Facebook', icon: <Facebook size={16} />, baseUrl: 'https://facebook.com/' },
    { value: 'whatsapp', label: 'WhatsApp', icon: <WhatsApp size={16} />, baseUrl: '55' },
    { value: 'twitter', label: 'Twitter / X', icon: <Twitter size={16} />, baseUrl: 'https://x.com/' },
    { value: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={16} />, baseUrl: 'https://linkedin.com/in/' },
    { value: 'youtube', label: 'YouTube', icon: <Youtube size={16} />, baseUrl: 'https://youtube.com/' },
    { value: 'pinterest', label: 'Pinterest', icon: <Pinterest size={16} />, baseUrl: 'https://pinterest.com/' },
    { value: 'site', label: 'Site / Link', icon: <LinkIcon size={16} />, baseUrl: 'https://' },
];

const BlockContentSettings = ({ selectedBlock, updateBlock, isAdmin, proposalId, onUploadComplete }) => {
    const { servicePackages, user } = useData();
    const { toast } = useToast();
    const fileInputRef = useRef(null);
    const testimonialFileInputRef = useRef(null);
    const pdfFileInputRef = useRef(null);

    const content = selectedBlock.content || {};

    const handleContentChange = (property, value) => {
        if (!selectedBlock) return;
        const newContent = { ...selectedBlock.content, [property]: value };
        updateBlock(selectedBlock.id, { content: newContent });
    };

    const handleItemChange = (itemsKey, index, field, value) => {
        const newItems = [...(content[itemsKey] || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        handleContentChange(itemsKey, newItems);
    };

    const handleAddItem = (itemsKey, newItem) => {
        const newItems = [...(content[itemsKey] || []), newItem];
        handleContentChange(itemsKey, newItems);
    };

    const handleRemoveItem = (itemsKey, index) => {
        const newItems = (content[itemsKey] || []).filter((_, i) => i !== index);
        handleContentChange(itemsKey, newItems);
    };
    
    const handlePackageSelection = (packageId, isSelected) => {
        if (!selectedBlock) return;
        const currentIds = selectedBlock.content?.packageIds || [];
        const newIds = isSelected 
            ? [...currentIds, packageId]
            : currentIds.filter(id => id !== packageId);
        handleContentChange('packageIds', newIds);
    };

    const handleImageChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "Arquivo muito grande", description: `A imagem excede o limite de 5MB.`, variant: "destructive" });
            return;
        }

        toast({ title: 'Enviando imagem...', description: 'Aguarde um momento.' });
        const filePath = `${user.id}/${proposalId || 'new'}/${uuidv4()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('propostas').upload(filePath, file);
        if (uploadError) {
          toast({ title: 'Erro no upload', description: uploadError.message, variant: 'destructive' });
          return;
        }
    
        const { data: { publicUrl } } = supabase.storage.from('propostas').getPublicUrl(filePath);
        handleContentChange('src', publicUrl);
        if (onUploadComplete) onUploadComplete();
        toast({ title: 'Imagem atualizada!', variant: 'success' });
    };

    const handlePdfUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        if (file.type !== 'application/pdf') {
            toast({ title: "Formato inválido", description: "Por favor, selecione um arquivo PDF.", variant: "destructive" });
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit for PDFs
            toast({ title: "Arquivo muito grande", description: `O PDF excede o limite de 10MB.`, variant: "destructive" });
            return;
        }

        toast({ title: 'Enviando PDF...', description: 'Aguarde um momento.' });
        const filePath = `${user.id}/${proposalId || 'new'}/pdfs/${uuidv4()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('propostas').upload(filePath, file);
        if (uploadError) {
          toast({ title: 'Erro no upload', description: uploadError.message, variant: 'destructive' });
          return;
        }
    
        const { data: { publicUrl } } = supabase.storage.from('propostas').getPublicUrl(filePath);
        handleContentChange('src', publicUrl);
        if (onUploadComplete) onUploadComplete();
        toast({ title: 'PDF carregado!', variant: 'success' });
    };

    const handleTestimonialImageUpload = async (event, index) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "Arquivo muito grande", description: `A imagem excede o limite de 5MB.`, variant: "destructive" });
            return;
        }
        toast({ title: 'Enviando foto...', description: 'Aguarde um momento.' });
        const filePath = `${user.id}/${proposalId || 'new'}/testimonials/${uuidv4()}-${file.name}`;
        const { error } = await supabase.storage.from('propostas').upload(filePath, file);
        if (error) {
            toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
            return;
        }
        const { data: { publicUrl } } = supabase.storage.from('propostas').getPublicUrl(filePath);
        handleItemChange('items', index, 'avatarUrl', publicUrl);
        toast({ title: 'Foto do cliente atualizada!', variant: 'success' });
    };

    const handlePlatformChange = (index, newPlatform) => {
        const platformInfo = socialPlatforms.find(p => p.value === newPlatform);
        const newItems = [...(content.items || [])];
        newItems[index] = { ...newItems[index], platform: newPlatform, url: platformInfo?.baseUrl || '' };
        handleContentChange('items', newItems);
    };

    switch (selectedBlock.type) {
        case 'text':
            return (
                <>
                    <Label>Texto (use {"{{CLIENT_NAME}}"} para nome do cliente)</Label>
                    <Textarea value={content.text} onChange={e => handleContentChange('text', e.target.value)} />
                    <Label>Nível</Label>
                    <Select value={content.level || 'p'} onValueChange={val => handleContentChange('level', val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="h1">Título 1</SelectItem>
                            <SelectItem value="h2">Título 2</SelectItem>
                            <SelectItem value="h3">Título 3</SelectItem>
                            <SelectItem value="p">Parágrafo</SelectItem>
                        </SelectContent>
                    </Select>
                </>
            );
        case 'image':
            return (
                <div className="space-y-2">
                    <Button onClick={() => fileInputRef.current?.click()} className="w-full">Alterar Imagem (Max 5MB)</Button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*"/>
                    <Label>Texto Alternativo (SEO)</Label>
                    <Input value={content.alt} onChange={e => handleContentChange('alt', e.target.value)} placeholder="Descreva a imagem"/>
                    <Label>URL da Imagem (Opcional)</Label>
                    <Input value={content.src?.startsWith('http') ? content.src : ''} onChange={e => handleContentChange('src', e.target.value)} placeholder="Cole um link de imagem aqui"/>
                </div>
            );
        case 'pdf':
            return (
                <div className="space-y-2">
                    <Button onClick={() => pdfFileInputRef.current?.click()} className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        {content.src ? 'Alterar PDF (Max 10MB)' : 'Fazer upload de PDF (Max 10MB)'}
                    </Button>
                    <input type="file" ref={pdfFileInputRef} className="hidden" onChange={handlePdfUpload} accept="application/pdf"/>
                    <Label>URL do PDF (Opcional)</Label>
                    <Input value={content.src?.startsWith('http') ? content.src : ''} onChange={e => handleContentChange('src', e.target.value)} placeholder="Cole um link de PDF público aqui"/>
                    {content.src && (
                        <p className="text-xs text-muted-foreground truncate">
                            Arquivo atual: <a href={content.src} target="_blank" rel="noopener noreferrer" className="underline">{content.src.split('/').pop()}</a>
                        </p>
                    )}
                </div>
            );
        case 'button':
            return (
                <div className="space-y-2">
                    <Label>Texto do Botão</Label>
                    <Input value={content.text} onChange={e => handleContentChange('text', e.target.value)} />
                    <Label>Link (URL)</Label>
                    <Input type="url" value={content.href} onChange={e => handleContentChange('href', e.target.value)} />
                    <div className="flex items-center space-x-2">
                        <Checkbox id="target-blank" checked={content.target === '_blank'} onCheckedChange={checked => handleContentChange('target', checked ? '_blank' : '_self')} />
                        <label htmlFor="target-blank" className="text-sm font-medium leading-none">Abrir em nova aba</label>
                    </div>
                </div>
            );
        case 'packages':
            return (
                <>
                    <Label>Título da Seção</Label>
                    <Input value={content.title} onChange={e => handleContentChange('title', e.target.value)} />
                    <Label className="mt-2">Layout</Label>
                    <Select value={content.layout || 'grid'} onValueChange={v => handleContentChange('layout', v)}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grade</SelectItem>
                        <SelectItem value="table">Tabela Comparativa</SelectItem>
                        <SelectItem value="accordion">Accordion</SelectItem>
                      </SelectContent>
                    </Select>
                    {!isAdmin && (
                        <>
                        <Label className="mt-2">Selecionar Pacotes</Label>
                        <div className="space-y-2 p-2 border rounded-md max-h-60 overflow-y-auto">
                            {(servicePackages || []).map(pkg => (
                                <div key={pkg.id} className="flex items-center space-x-2">
                                    <Checkbox id={`pkg-${pkg.id}`} checked={(content.packageIds || []).includes(pkg.id)} onCheckedChange={checked => handlePackageSelection(pkg.id, checked)} />
                                    <label htmlFor={`pkg-${pkg.id}`} className="text-sm">{pkg.name}</label>
                                </div>
                            ))}
                        </div>
                        </>
                    )}
                </>
            );
        case 'testimonial':
            return (
                <div className="space-y-4">
                    <Label>Layout</Label>
                    <Select value={content.layout || 'slider'} onValueChange={v => handleContentChange('layout', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="slider">Carrossel</SelectItem>
                            <SelectItem value="grid">Grade</SelectItem>
                            <SelectItem value="card">Cartão Único</SelectItem>
                            <SelectItem value="quote">Citação Única</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="space-y-4">
                        {(content.items || []).map((item, index) => (
                            <div key={item.id} className="p-3 border rounded-md space-y-2 relative">
                                <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => handleRemoveItem('items', index)}><Trash2 size={12} /></Button>
                                <Label>Nome</Label>
                                <Input value={item.name} onChange={e => handleItemChange('items', index, 'name', e.target.value)} />
                                <Label>Título/Cargo</Label>
                                <Input value={item.role} onChange={e => handleItemChange('items', index, 'role', e.target.value)} />
                                <Label>Depoimento</Label>
                                <Textarea value={item.text} onChange={e => handleItemChange('items', index, 'text', e.target.value)} />
                                <Label>Foto do Cliente</Label>
                                <Button variant="outline" className="w-full" onClick={() => testimonialFileInputRef.current?.click()}>Upload Foto</Button>
                                <input type="file" ref={testimonialFileInputRef} className="hidden" onChange={(e) => handleTestimonialImageUpload(e, index)} accept="image/*" />
                                {item.avatarUrl && <img src={item.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover mt-2" />}
                            </div>
                        ))}
                    </div>
                    <Button onClick={() => handleAddItem('items', { id: uuidv4(), name: 'Novo Cliente', role: 'Título', text: 'Depoimento...', avatarUrl: '' })} className="w-full"><PlusCircle size={16} className="mr-2" /> Adicionar Depoimento</Button>
                </div>
            );
         case 'cta':
            return (
                <div className="space-y-4">
                    <Label>Título</Label>
                    <Input value={content.title} onChange={e => handleContentChange('title', e.target.value)} />
                    <Label>Subtítulo</Label>
                    <Textarea value={content.subtitle} onChange={e => handleContentChange('subtitle', e.target.value)} />
                    <p className="text-sm font-medium pt-2">Botões</p>
                    {(content.buttons || []).map((button, index) => (
                        <div key={button.id} className="p-3 border rounded-md space-y-2 relative">
                            <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => handleRemoveItem('buttons', index)}><Trash2 size={12} /></Button>
                            <Label>Texto do Botão</Label>
                            <Input value={button.text} onChange={e => handleItemChange('buttons', index, 'text', e.target.value)} />
                            <Label>Ação</Label>
                            <Select value={button.actionType} onValueChange={v => handleItemChange('buttons', index, 'actionType', v)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="accept">Aceitar Proposta</SelectItem>
                                    <SelectItem value="link">Abrir Link</SelectItem>
                                    <SelectItem value="whatsapp">Abrir WhatsApp</SelectItem>
                                </SelectContent>
                            </Select>
                            {(button.actionType === 'link' || button.actionType === 'whatsapp') && (
                                <>
                                <Label>Link ou Telefone</Label>
                                <Input value={button.link} onChange={e => handleItemChange('buttons', index, 'link', e.target.value)} placeholder={button.actionType === 'whatsapp' ? '5511999998888' : 'https://...'} />
                                </>
                            )}
                        </div>
                    ))}
                    <Button onClick={() => handleAddItem('buttons', { id: uuidv4(), text: 'Novo Botão', actionType: 'link', link: '#' })} className="w-full"><PlusCircle size={16} className="mr-2"/> Adicionar Botão</Button>
                </div>
            );
        case 'social':
            return (
                <div className="space-y-4">
                    {(content.items || []).map((item, index) => (
                        <div key={item.id} className="p-3 border rounded-md space-y-2 relative">
                            <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => handleRemoveItem('items', index)}><Trash2 size={12} /></Button>
                            <Label>Plataforma</Label>
                            <Select value={item.platform} onValueChange={v => handlePlatformChange(index, v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {socialPlatforms.map(p => <SelectItem key={p.value} value={p.value}>{p.icon}<span className="ml-2">{p.label}</span></SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Label>URL ou Usuário</Label>
                            <Input value={item.url} onChange={e => handleItemChange('items', index, 'url', e.target.value)} />
                        </div>
                    ))}
                    <Button onClick={() => handleAddItem('items', { id: uuidv4(), platform: 'instagram', url: 'https://instagram.com/' })} className="w-full"><PlusCircle size={16} className="mr-2"/> Adicionar Rede Social</Button>
                </div>
            );
        default:
            return <p className="text-sm text-muted-foreground">Este bloco não possui conteúdo editável.</p>
    }
};

export default BlockContentSettings;