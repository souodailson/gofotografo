import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical, Save, Loader2, ArrowLeft, UploadCloud } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import FormSuccessModal from '@/components/modals/FormSuccessModal';

const FormEditorPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useData();
  const { toast } = useToast();

  const [form, setForm] = useState({ title: '', description: '', logo_url: null, form_type: 'client_registration', campaign_tag: '', background_image_url: null });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [bgImageFile, setBgImageFile] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [newFormLink, setNewFormLink] = useState('');

  const fetchFormAndQuestions = useCallback(async () => {
    if (formId === 'new') {
      if(location.state?.template) {
        const template = location.state.template;
        setForm(prev => ({
          ...prev,
          title: template.title || '',
          description: template.description || '',
          form_type: location.state.templateType || 'client_registration',
        }));
        setQuestions(template.questions.map((q, index) => ({...q, id: uuidv4(), order: index })));
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: formData, error: formError } = await supabase
        .from('client_forms')
        .select('*')
        .eq('id', formId)
        .eq('user_id', user.id)
        .single();
      if (formError) throw formError;
      setForm(formData);

      const { data: questionsData, error: questionsError } = await supabase
        .from('form_questions')
        .select('*')
        .eq('form_id', formId)
        .order('order', { ascending: true });
      if (questionsError) throw questionsError;
      setQuestions(questionsData);
    } catch (error) {
      toast({ title: "Erro ao carregar formulário", description: error.message, variant: "destructive" });
      navigate('/forms');
    } finally {
      setLoading(false);
    }
  }, [formId, user, toast, navigate, location.state]);

  useEffect(() => {
    fetchFormAndQuestions();
  }, [fetchFormAndQuestions]);

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleQuestionChange = (id, field, value) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: uuidv4(),
      form_id: formId,
      user_id: user.id,
      question_text: '',
      question_type: 'short_text',
      is_required: false,
      order: questions.length,
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const deleteQuestion = (id) => setQuestions(prev => prev.filter(q => q.id !== id));

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const updatedItems = items.map((item, index) => ({ ...item, order: index }));
    setQuestions(updatedItems);
  };

  const handleFileUpload = async (file, folder) => {
    if (!file) return null;
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ title: "Arquivo muito grande", description: "O tamanho da imagem não pode exceder 5MB.", variant: "destructive" });
      return 'error';
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${formId || 'new'}-${uuidv4()}.${fileExt}`;
    const filePath = `public/${user.id}/${folder}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('user_assets')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from('user_assets').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let currentFormId = formId;
      let wasNew = formId === 'new';
      let shareableLinkId = form.shareable_link_id;
      let logoUrl = form.logo_url;
      let backgroundImageUrl = form.background_image_url;

      if (logoFile) {
        const uploadedUrl = await handleFileUpload(logoFile, 'form_logos');
        if (uploadedUrl === 'error') { setIsSaving(false); return; }
        logoUrl = uploadedUrl;
      }
      if (bgImageFile) {
        const uploadedUrl = await handleFileUpload(bgImageFile, 'form_backgrounds');
        if (uploadedUrl === 'error') { setIsSaving(false); return; }
        backgroundImageUrl = uploadedUrl;
      }

      const formPayload = { ...form, user_id: user.id, logo_url: logoUrl, background_image_url: backgroundImageUrl };
      delete formPayload.id; 

      if (wasNew) {
        const { data: newForm, error: newFormError } = await supabase
          .from('client_forms')
          .insert(formPayload)
          .select()
          .single();
        if (newFormError) throw newFormError;
        currentFormId = newForm.id;
        shareableLinkId = newForm.shareable_link_id;
        setForm(newForm);
      } else {
        const { data: updatedForm, error: updateFormError } = await supabase
          .from('client_forms')
          .update(formPayload)
          .eq('id', formId)
          .select()
          .single();
        if (updateFormError) throw updateFormError;
        setForm(updatedForm);
      }

      const questionsPayload = questions.map((q, index) => ({
        ...q,
        form_id: currentFormId,
        user_id: user.id,
        order: q.order ?? index,
      }));
      
      const { error: deleteError } = await supabase.from('form_questions').delete().eq('form_id', currentFormId);
      if (deleteError) throw deleteError;

      const { error: upsertError } = await supabase.from('form_questions').upsert(questionsPayload);
      if (upsertError) throw upsertError;

      toast({ title: "Formulário salvo com sucesso!" });

      if (wasNew) {
        setNewFormLink(`${window.location.origin}/f/${shareableLinkId}`);
        setIsSuccessModalOpen(true);
        navigate(`/forms/edit/${currentFormId}`, { replace: true });
      } else {
        fetchFormAndQuestions();
      }
    } catch (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Carregando editor...</div>;

  return (
    <>
    <FormSuccessModal
      isOpen={isSuccessModalOpen}
      onClose={() => setIsSuccessModalOpen(false)}
      shareableLink={newFormLink}
    />
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/forms')}><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
        <h1 className="text-3xl font-bold text-foreground titulo-gradiente">Editor de Formulário</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar
        </Button>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-md border border-border space-y-4">
        <h2 className="text-xl font-semibold">Detalhes do Formulário</h2>
        
        <div>
          <Label htmlFor="form_type">Tipo de Formulário</Label>
          <Select value={form.form_type} onValueChange={(value) => handleFormChange('form_type', value)}>
            <SelectTrigger id="form_type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="client_registration">Cadastro de Cliente</SelectItem>
              <SelectItem value="client_and_briefing">Cadastro de Cliente + Briefing</SelectItem>
              <SelectItem value="lead_campaign">Campanha de Leads</SelectItem>
              <SelectItem value="feedback">Pesquisa de Feedback</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="title">Título</Label>
          <Input id="title" value={form.title} onChange={(e) => handleFormChange('title', e.target.value)} placeholder="Ex: Briefing de Casamento" />
        </div>
        
        {form.form_type === 'lead_campaign' && (
          <div>
            <Label htmlFor="campaign_tag">Etiqueta da Campanha</Label>
            <Input id="campaign_tag" value={form.campaign_tag || ''} onChange={(e) => handleFormChange('campaign_tag', e.target.value)} placeholder="Ex: Expo Noivas 2024" />
          </div>
        )}

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" value={form.description || ''} onChange={(e) => handleFormChange('description', e.target.value)} placeholder="Instruções para o cliente" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Logo (Opcional)</label>
            <div className="flex items-center gap-4">
              {form.logo_url && !logoFile && <img src={form.logo_url} alt="Logo" className="h-16 w-auto rounded-md bg-muted p-1" />}
              {logoFile && <img src={URL.createObjectURL(logoFile)} alt="Preview" className="h-16 w-auto rounded-md bg-muted p-1" />}
              <Input type="file" onChange={(e) => setLogoFile(e.target.files[0])} accept="image/*" className="hidden" id="logo-upload" />
              <label htmlFor="logo-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 p-2 border border-dashed rounded-md hover:bg-accent">
                  <UploadCloud className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{logoFile ? logoFile.name : "Escolher arquivo"}</span>
                </div>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Imagem de Fundo (Opcional)</label>
            <div className="flex items-center gap-4">
              {form.background_image_url && !bgImageFile && <img src={form.background_image_url} alt="Background" className="h-16 w-auto rounded-md bg-muted p-1 object-cover" />}
              {bgImageFile && <img src={URL.createObjectURL(bgImageFile)} alt="Preview" className="h-16 w-auto rounded-md bg-muted p-1 object-cover" />}
              <Input type="file" onChange={(e) => setBgImageFile(e.target.files[0])} accept="image/*" className="hidden" id="bg-image-upload" />
              <label htmlFor="bg-image-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 p-2 border border-dashed rounded-md hover:bg-accent">
                  <UploadCloud className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{bgImageFile ? bgImageFile.name : "Escolher arquivo"}</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-md border border-border space-y-4">
        <h2 className="text-xl font-semibold">Perguntas</h2>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {questions.map((q, index) => (
                  <Draggable key={q.id} draggableId={String(q.id)} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-start gap-2 p-4 border rounded-md bg-background">
                        <div {...provided.dragHandleProps} className="pt-2 cursor-grab text-muted-foreground"><GripVertical /></div>
                        <div className="flex-grow space-y-2">
                          <Input value={q.question_text} onChange={(e) => handleQuestionChange(q.id, 'question_text', e.target.value)} placeholder="Digite sua pergunta" />
                          <div className="flex items-center justify-between">
                            <Select value={q.question_type} onValueChange={(value) => handleQuestionChange(q.id, 'question_type', value)}>
                              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="short_text">Texto Curto</SelectItem>
                                <SelectItem value="long_text">Texto Longo</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Telefone</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Checkbox id={`required-${q.id}`} checked={q.is_required} onCheckedChange={(checked) => handleQuestionChange(q.id, 'is_required', checked)} />
                                <label htmlFor={`required-${q.id}`} className="text-sm">Obrigatório</label>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => deleteQuestion(q.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <Button variant="outline" onClick={addQuestion} className="w-full"><Plus className="w-4 h-4 mr-2" /> Adicionar Pergunta</Button>
      </div>
    </div>
    </>
  );
};

export default FormEditorPage;