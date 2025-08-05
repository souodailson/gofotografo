import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Save, Eye, Send, Loader2, ArrowLeft, Globe, Lock } from 'lucide-react';
import EditorToolbar from '@/components/contracts/EditorToolbar';
import { Textarea } from '@/components/ui/textarea';

const ContractEditorPage = ({ mode: propMode, isTemplateMode = false }) => {
  const { contractId, templateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const id = isTemplateMode ? templateId : contractId;
  const mode = isTemplateMode ? (templateId ? 'edit' : 'new') : (contractId ? 'edit' : 'new');

  const { user, refreshData, settings } = useData();
  const { toast } = useToast();

  const [recordId, setRecordId] = useState(id);
  const [title, setTitle] = useState(isTemplateMode ? 'Novo Modelo de Contrato' : 'Novo Contrato');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('privado');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  
  const hasCreatedRecord = useRef(false);

  const debouncedTitle = useDebounce(title, 1500);
  const debouncedContent = useDebounce(content, 1500);
  const debouncedDescription = useDebounce(description, 1500);
  const debouncedStatus = useDebounce(status, 1500);

  const editor = useEditor({
    extensions: [
      StarterKit, Underline, Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Comece a escrever seu contrato aqui...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }), Highlight, TextStyle, Color,
      Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
    ],
    content: '',
    editorProps: {
      attributes: { class: 'prose dark:prose-invert max-w-none focus:outline-none p-8 min-h-[500px]' },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
      // Auto-save on content change only after initial load/creation
      if (!isLoading && recordId && hasCreatedRecord.current) {
        // Debounced save will be triggered by useEffect
      } else if (!isLoading && !recordId && !hasCreatedRecord.current) {
        // First content change on a new document, create it
        createNewRecord(editor.getHTML());
      }
    },
  });

  const saveRecord = useCallback(async (currentData) => {
    if (!user || !editor || !recordId || isSaving) return;
    setIsSaving(true);
    
    const tableName = isTemplateMode ? 'modeloscontrato' : 'contratosgerados';
    const recordData = isTemplateMode
      ? { nome_modelo: currentData.title, conteudo_template: currentData.content, status: currentData.status, description: currentData.description }
      : { titulo_contrato: currentData.title, conteudo_final: currentData.content };
    
    try {
      const { error } = await supabase.from(tableName).update(recordData).eq('id', recordId);
      if (error) throw error;
      setLastSaved(new Date());
    } catch (error) {
      toast({ title: 'Erro ao salvar', description: `Não foi possível salvar. ${error.message}`, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [recordId, user, editor, toast, isSaving, isTemplateMode]);
  
  const createNewRecord = useCallback(async (initialContent = '<p></p>') => {
    if (hasCreatedRecord.current || recordId) return;
    hasCreatedRecord.current = true;
    setIsSaving(true);
    
    const tableName = isTemplateMode ? 'modeloscontrato' : 'contratosgerados';
    const defaultData = isTemplateMode
      ? { nome_modelo: 'Novo Modelo (Rascunho)', conteudo_template: initialContent, status: 'privado', description: '', user_id: user.id }
      : { id_fotografo: user.id, titulo_contrato: 'Novo Contrato (Rascunho)', conteudo_final: initialContent, status_assinatura: 'draft' };
      
    try {
      const { data, error } = await supabase.from(tableName).insert(defaultData).select().single();
      if (error) throw error;
      
      await refreshData(isTemplateMode ? 'modeloscontrato' : 'contratos');
      
      const newPath = isTemplateMode 
          ? `/control-acess/contract-templates/edit/${data.id}` 
          : `/studio/contracts/edit/${data.id}`;
      
      navigate(newPath, { replace: true });
      setRecordId(data.id);
      setTitle(isTemplateMode ? data.nome_modelo : data.titulo_contrato);
      if (isTemplateMode) {
          setStatus(data.status);
          setDescription(data.description);
      }
      setLastSaved(new Date());

    } catch (error) {
      toast({ title: `Erro ao criar ${isTemplateMode ? 'modelo' : 'contrato'}`, description: error.message, variant: 'destructive' });
      navigate(isTemplateMode ? '/control-acess/contract-templates' : '/studio');
    } finally {
      setIsSaving(false);
    }
  }, [recordId, user, refreshData, toast, navigate, isTemplateMode]);


  useEffect(() => {
    if (isLoading || !hasCreatedRecord.current) return;
    saveRecord({ title, content: debouncedContent, description, status });
  }, [debouncedContent]);
  
  useEffect(() => {
    if (isLoading || !hasCreatedRecord.current) return;
    saveRecord({ title: debouncedTitle, content, description: debouncedDescription, status: debouncedStatus });
  }, [debouncedTitle, debouncedDescription, debouncedStatus]);

  useEffect(() => {
    const loadRecord = async (recordIdToLoad) => {
      setIsLoading(true);
      const tableName = isTemplateMode ? 'modeloscontrato' : 'contratosgerados';
      const fields = isTemplateMode ? 'id, nome_modelo, conteudo_template, status, description' : 'id, titulo_contrato, conteudo_final';
      
      try {
        const { data, error } = await supabase.from(tableName).select(fields).eq('id', recordIdToLoad).single();
        if (error) throw error;
        
        hasCreatedRecord.current = true; // Mark as existing
        if (isTemplateMode) {
          setTitle(data.nome_modelo);
          setContent(data.conteudo_template);
          setStatus(data.status);
setDescription(data.description);
        } else {
          setTitle(data.titulo_contrato);
          setContent(data.conteudo_final);
        }

        if (editor) editor.commands.setContent(data.conteudo_template || data.conteudo_final || '<p></p>');
      } catch (error) {
        toast({ title: `Erro ao carregar ${isTemplateMode ? 'modelo' : 'contrato'}`, description: error.message, variant: 'destructive' });
        navigate(isTemplateMode ? '/control-acess/contract-templates' : '/studio');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && editor) {
      if (mode === 'edit' && id) {
        setRecordId(id);
        loadRecord(id);
      } else if (mode === 'new') {
        setIsLoading(false);
        setTitle(isTemplateMode ? 'Novo Modelo de Contrato' : 'Novo Contrato');
        setContent('');
        editor.commands.clearContent();
        setRecordId(null);
        hasCreatedRecord.current = false;
      }
    }
  }, [id, mode, user, editor, navigate, toast, isTemplateMode]);

  const handleBackNavigation = () => {
    navigate(isTemplateMode ? '/control-acess/contract-templates' : '/studio');
  };

  const handleSendToAssinafy = async () => {
    if(!settings.assinafy_api_key) {
      toast({ title: "API Key não configurada", description: "Vá para Configurações > Integrações para adicionar sua chave da API Assinafy.", variant: "destructive" });
      return;
    }
    toast({ title: "🚧 Em Desenvolvimento", description: "A funcionalidade de envio para Assinafy a partir do editor está sendo finalizada!" });
  };

  if ((mode === 'edit' && isLoading) || !editor) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-muted dark:bg-black">
      <header className="flex flex-wrap items-center justify-between gap-4 p-3 bg-background border-b sticky top-0 z-20">
        <div className="flex items-center gap-2 sm:gap-4 flex-grow">
          <Button variant="ghost" size="icon" onClick={handleBackNavigation}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold border-none focus-visible:ring-0 shadow-none p-1"
            placeholder={isTemplateMode ? "Nome do Modelo" : "Título do Contrato"}
            disabled={isSaving}
          />
        </div>
        <div className="flex items-center gap-2">
          {isSaving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {lastSaved && <span className="text-xs text-muted-foreground hidden sm:inline">Salvo {lastSaved.toLocaleTimeString()}</span>}
          <Button variant="outline" size="sm" onClick={() => toast({title: "Em breve!"})}><Eye className="w-4 h-4 mr-2" /> Visualizar</Button>
          {!isTemplateMode && <Button size="sm" onClick={handleSendToAssinafy}><Send className="w-4 h-4 mr-2" /> Enviar</Button>}
        </div>
      </header>
      
      {isTemplateMode && (
         <div className="p-3 bg-background border-b flex flex-wrap gap-4 items-end">
            <div className="flex-grow">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" placeholder="Descreva brevemente para que serve este modelo." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[40px]"/>
            </div>
            <div>
               <Label htmlFor="status">Status</Label>
               <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="w-[180px]">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publico"><Globe className="w-4 h-4 mr-2 inline-block"/> Público</SelectItem>
                  <SelectItem value="privado"><Lock className="w-4 h-4 mr-2 inline-block"/> Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>
         </div>
      )}

      <main className="flex-grow overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto bg-background shadow-lg my-4 sm:my-8 rounded-lg">
          <EditorToolbar editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </main>
    </div>
  );
};

export default ContractEditorPage;