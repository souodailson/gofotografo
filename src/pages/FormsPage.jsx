import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Share2, FileText, BarChart2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
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
import FormCreationModal from '@/components/modals/FormCreationModal';
import { formTemplates } from '@/lib/formTemplates';
import FormSuccessModal from '@/components/modals/FormSuccessModal';

const FormsPage = () => {
  const { user } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [newFormLink, setNewFormLink] = useState('');

  useEffect(() => {
    const fetchForms = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('client_forms')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setForms(data);
      } catch (error) {
        toast({ title: "Erro ao buscar formulários", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, [user, toast]);

  const handleSelectTemplate = (templateType) => {
    setIsCreationModalOpen(false);
    if (templateType === 'blank') {
      navigate('/forms/edit/new');
    } else {
      const template = formTemplates[templateType];
      navigate('/forms/edit/new', { state: { template, templateType } });
    }
  };

  const handleDeleteForm = async (formId) => {
    try {
      await supabase.from('lead_submissions').delete().eq('form_id', formId);
      await supabase.from('feedback_submissions').delete().eq('form_id', formId);
      const { error } = await supabase.from('client_forms').delete().eq('id', formId);
      if (error) throw error;
      setForms(forms.filter(form => form.id !== formId));
      toast({ title: "Formulário excluído com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao excluir formulário", description: error.message, variant: "destructive" });
    }
  };

  const handleShareForm = (shareableId) => {
    const url = `${window.location.origin}/f/${shareableId}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!", description: "O link do formulário foi copiado para a área de transferência." });
  };
  
  const getFormTypeLabel = (type) => {
    switch (type) {
      case 'client_registration': return 'Cadastro de Cliente';
      case 'client_and_briefing': return 'Cadastro + Briefing';
      case 'lead_campaign': return 'Campanha de Leads';
      case 'feedback': return 'Pesquisa de Feedback';
      default: return 'Briefing';
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
       <FormCreationModal 
        isOpen={isCreationModalOpen}
        onClose={() => setIsCreationModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
       <FormSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        shareableLink={newFormLink}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground titulo-gradiente">Formulários de Captação</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Crie e gerencie seus formulários de briefing e cadastro.</p>
        </motion.div>
        <Button onClick={() => setIsCreationModalOpen(true)} className="btn-custom-gradient text-white shadow-lg w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Formulário
        </Button>
      </div>

      {forms.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-card rounded-xl p-6 shadow-lg border border-border">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-md sm:text-lg font-medium text-foreground mb-2">Nenhum formulário criado ainda</h3>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">Comece a captar clientes de forma inteligente.</p>
          <Button onClick={() => setIsCreationModalOpen(true)} className="btn-custom-gradient text-white">
            <Plus className="w-4 h-4 mr-2" />
            Criar seu primeiro formulário
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map(form => (
            <motion.div key={form.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-6 shadow-lg border border-border flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg text-foreground mb-1">{form.title}</h3>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full whitespace-nowrap">{getFormTypeLabel(form.form_type)}</span>
                </div>
                {form.campaign_tag && <span className="text-xs font-semibold bg-primary/20 text-primary-foreground px-2 py-1 rounded-full">{form.campaign_tag}</span>}
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{form.description || "Sem descrição"}</p>
              </div>
              <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-border">
                {form.form_type !== 'feedback' && (
                   <Button variant="outline" size="icon" title="Ver Envios" onClick={() => navigate(`/campaigns/${form.id}`)}><BarChart2 className="w-4 h-4" /></Button>
                )}
                <Button variant="outline" size="icon" title="Compartilhar" onClick={() => handleShareForm(form.shareable_link_id)}><Share2 className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" title="Editar" onClick={() => navigate(`/forms/edit/${form.id}`)}><Edit className="w-4 h-4" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" title="Excluir"><Trash2 className="w-4 h-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o formulário e todas as suas respostas/leads.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteForm(form.id)}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormsPage;