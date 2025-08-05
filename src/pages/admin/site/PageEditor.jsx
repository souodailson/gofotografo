import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/authContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import FullScreenLoader from '@/components/FullScreenLoader';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, PlusCircle, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const BlockEditor = ({ block, onUpdate, onDelete }) => {
  const handleContentChange = (e) => {
    onUpdate(block.id, { ...block, content: { ...block.content, [e.target.name]: e.target.value } });
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'h1':
      case 'h2':
      case 'p':
        return <Input name="text" value={block.content.text || ''} onChange={handleContentChange} placeholder={`Texto do ${block.type}`} />;
      case 'img':
        return (
          <div className="space-y-2">
            <Input name="src" value={block.content.src || ''} onChange={handleContentChange} placeholder="URL da Imagem" />
            <Input name="alt" value={block.content.alt || ''} onChange={handleContentChange} placeholder="Texto alternativo" />
          </div>
        );
      default:
        return <p>Bloco desconhecido</p>;
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
      <div className="flex justify-between items-center">
        <Label className="font-semibold capitalize">{block.type}</Label>
        <Button variant="ghost" size="icon" onClick={() => onDelete(block.id)}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
      {renderBlockContent()}
    </div>
  );
};

const PageEditor = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [page, setPage] = useState({
    title: '',
    slug: '',
    content: [],
    cover_image_url: '',
    seo_title: '',
    seo_description: '',
    is_published: false,
    show_in_footer: false,
    page_type: 'standard',
    template_name: 'standard',
    page_options: {},
  });
  const [loading, setLoading] = useState(false);
  const isNew = !pageId;

  const fetchPage = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    const { data, error } = await supabase.from('custom_pages').select('*').eq('id', pageId).single();
    if (error) {
      toast({ title: 'Erro ao carregar página', description: error.message, variant: 'destructive' });
      navigate('/control-acess/site');
    } else if (data) {
      setPage({
        ...data,
        content: Array.isArray(data.content) ? data.content : [],
        page_options: data.page_options || {},
      });
    }
    setLoading(false);
  }, [pageId, isNew, navigate, toast]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleSlugify = (text) => text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setPage(prev => ({ ...prev, title: value, slug: handleSlugify(value) }));
    } else {
      setPage(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (name, checked) => {
    setPage(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Erro de autenticação', variant: 'destructive' });
      return;
    }
    setLoading(true);

    const pageData = { ...page, user_id: user.id };
    let result;
    if (isNew) {
      result = await supabase.from('custom_pages').insert(pageData).select().single();
    } else {
      result = await supabase.from('custom_pages').update(pageData).eq('id', pageId).select().single();
    }

    const { data, error } = result;
    if (error) {
      toast({ title: 'Erro ao salvar página', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Página salva com sucesso!' });
      if (isNew) navigate(`/control-acess/site/edit/${data.id}`);
    }
    setLoading(false);
  };

  const addBlock = (type) => {
    const newBlock = { id: uuidv4(), type, content: {} };
    setPage(prev => ({ ...prev, content: [...prev.content, newBlock] }));
  };

  const updateBlock = (id, updatedBlock) => {
    setPage(prev => ({ ...prev, content: prev.content.map(b => b.id === id ? updatedBlock : b) }));
  };

  const deleteBlock = (id) => {
    setPage(prev => ({ ...prev, content: prev.content.filter(b => b.id !== id) }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(page.content);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPage(prev => ({ ...prev, content: items }));
  };

  if (loading && !isNew) return <FullScreenLoader />;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{isNew ? 'Nova Página' : 'Editar Página'}</h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/control-acess/site')}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Página'}</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Conteúdo Principal</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input name="title" value={page.title} onChange={handleChange} required placeholder="Título da Página" />
              <Input name="slug" value={page.slug} onChange={handleChange} required placeholder="URL (slug)" />
              {page.slug && <p className="text-xs text-muted-foreground mt-1">Sua página estará em: <a href={`/${page.page_type === 'tutorial' ? 'tutoriais' : 'p'}/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{`.../${page.page_type === 'tutorial' ? 'tutoriais' : 'p'}/${page.slug}`}</a></p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Construtor de Página</CardTitle></CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="blocks">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                      {page.content.map((block, index) => (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-2">
                              <span {...provided.dragHandleProps} className="cursor-grab"><GripVertical /></span>
                              <div className="flex-grow"><BlockEditor block={block} onUpdate={updateBlock} onDelete={deleteBlock} /></div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <div className="flex gap-2 mt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => addBlock('h1')}><PlusCircle className="w-4 h-4 mr-2" /> Título 1</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addBlock('h2')}><PlusCircle className="w-4 h-4 mr-2" /> Título 2</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addBlock('p')}><PlusCircle className="w-4 h-4 mr-2" /> Parágrafo</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addBlock('img')}><PlusCircle className="w-4 h-4 mr-2" /> Imagem</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input name="seo_title" value={page.seo_title || ''} onChange={handleChange} placeholder="Título para SEO" />
              <Textarea name="seo_description" value={page.seo_description || ''} onChange={handleChange} rows={3} placeholder="Descrição para SEO" />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Publicação</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label htmlFor="is_published">Publicar</Label><Switch id="is_published" checked={page.is_published} onCheckedChange={(c) => handleSwitchChange('is_published', c)} /></div>
              <div className="flex items-center justify-between"><Label htmlFor="show_in_footer">Mostrar no Rodapé</Label><Switch id="show_in_footer" checked={page.show_in_footer} onCheckedChange={(c) => handleSwitchChange('show_in_footer', c)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Configurações</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template_name">Template da Página</Label>
                <Select value={page.template_name} onValueChange={(v) => setPage(p => ({...p, template_name: v}))}>
                  <SelectTrigger id="template_name"><SelectValue placeholder="Selecione o template" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Padrão</SelectItem>
                    <SelectItem value="contact">Contato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="page_type">Tipo de Página</Label>
                <Select value={page.page_type} onValueChange={(v) => setPage(p => ({...p, page_type: v}))}>
                  <SelectTrigger id="page_type"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Padrão</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input name="cover_image_url" value={page.cover_image_url || ''} onChange={handleChange} placeholder="URL da Imagem de Capa" />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default PageEditor;