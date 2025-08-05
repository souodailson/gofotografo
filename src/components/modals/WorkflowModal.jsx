import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import ClientModal from '@/components/modals/ClientModal';
import WorkflowModalForm from '@/components/modals/WorkflowModalForm';
import WorkflowModalSubtasks from '@/components/workflow/WorkflowModalSubtasks';
import WorkflowModalComments from '@/components/workflow/WorkflowModalComments';
import WorkflowModalHistory from '@/components/workflow/WorkflowModalHistory';
import WorkflowModalTabs from '@/components/workflow/WorkflowModalTabs';
import { useModalState } from '@/contexts/ModalStateContext';
import { parseISO } from 'date-fns';
import QuickCreateForm from '@/components/workflow/QuickCreateForm';

const defaultPhotographerSubtasks = [
  { text: "Confirmar detalhes do evento com o cliente", completed: false },
  { text: "Verificar e preparar equipamento fotográfico", completed: false },
  { text: "Scout do local (se aplicável)", completed: false },
  { text: "Definir cronograma do dia do evento/ensaio", completed: false },
  { text: "Realizar o evento/ensaio fotográfico", completed: false },
  { text: "Fazer backup de todas as fotos e vídeos", completed: false },
  { text: "Selecionar as melhores fotos (curadoria)", completed: false },
  { text: "Edição e tratamento das imagens selecionadas", completed: false },
  { text: "Preparar galeria online ou prévia para o cliente", completed: false },
  { text: "Enviar prévia para aprovação do cliente", completed: false },
  { text: "Realizar ajustes finais (se necessário)", completed: false },
  { text: "Preparar e exportar arquivos finais em alta resolução", completed: false },
  { text: "Entregar o material final ao cliente", completed: false },
  { text: "Enviar nota fiscal (se aplicável)", completed: false },
  { text: "Solicitar feedback/depoimento do cliente", completed: false },
  { text: "Arquivar projeto e materiais", completed: false },
];

const WorkflowModal = () => {
  const {
    clients,
    servicePackages,
    addWorkflowCard,
    updateWorkflowCard,
    getClientById,
    getServicePackageById,
    addComment,
    refreshData,
    user,
    settings,
    getWorkflowCardById
  } = useData();
  const { toast } = useToast();
  const { openModals, closeModal, openModal: openClientModal } = useModalState();
  const { isOpen, cardId, initialStatus, initialData } = openModals['workflow'] || {};
  const card = cardId ? getWorkflowCardById(cardId) : null;

  const getInitialFormData = useCallback(() => {
    const defaultStatusFromSettings = settings?.workflow_columns?.[0]?.id || 'novo-lead';
    const statusToUse = initialStatus || defaultStatusFromSettings;

    return {
      title: '', client_id: '', service_package_id: '', description: '',
      date: '',
      time: '',
      value: '', tags: [], status: statusToUse,
      contract_url: '', contract_name: '', contract_status: 'pending',
      comments: [], history: [],
      subtasks: defaultPhotographerSubtasks.map(st => ({ ...st, id: Math.random().toString(36).substr(2, 9) })),
      order: 0, archived: false, sync_google_calendar: false,
      payment_type: 'SOMENTE_AGENDADO',
      payment_method: '',
      entry_value: '',
      installments: '',
      num_installments: '',
      card_processing_days: '',
      entry_paid: false,
      first_installment_date: '',
      createFinancialTransaction: true,
      main_wallet_id: '',
      entry_wallet_id: '',
      ...initialData,
    };
  }, [settings, initialStatus, initialData]);

  const [formData, setFormData] = useState(getInitialFormData());
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState('quick');

  const DRAFT_KEY = card ? `workflow_form_draft_${card.id}` : `workflow_form_draft_new_${initialStatus || 'default'}`;

  useEffect(() => {
    if (isOpen) {
      setView(card ? 'full' : 'quick');
      const draft = localStorage.getItem(DRAFT_KEY);
      let baseData = getInitialFormData();
      
      if (card) {
        baseData = {
          ...getInitialFormData(), 
          ...card,
          client_id: card.client_id || '',
          service_package_id: card.service_package_id || '',
          value: card.value !== undefined && card.value !== null ? String(card.value) : '',
          entry_value: card.entry_value !== undefined && card.entry_value !== null ? String(card.entry_value) : '',
          installments: card.installments !== undefined && card.installments !== null ? String(card.installments) : '',
          num_installments: card.num_installments !== undefined && card.num_installments !== null ? String(card.num_installments) : '',
          card_processing_days: card.card_processing_days !== undefined && card.card_processing_days !== null ? String(card.card_processing_days) : '',
          subtasks: (card.subtasks && card.subtasks.length > 0
            ? card.subtasks.map(st => ({ ...st, id: st.id || Math.random().toString(36).substr(2, 9) }))
            : defaultPhotographerSubtasks.map(st => ({ ...st, id: Math.random().toString(36).substr(2, 9) }))),
        };
      }
      
      const effectiveData = draft ? { ...baseData, ...JSON.parse(draft) } : baseData;
      setFormData(effectiveData);
      setActiveTab('details');

    }
  }, [card, isOpen, getInitialFormData, DRAFT_KEY]);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }
  }, [formData, isOpen, DRAFT_KEY]);

  const handleCloseModal = () => {
    localStorage.removeItem(DRAFT_KEY);
    closeModal('workflow');
  };
  
  const handleSave = async (data) => {
    setIsSubmitting(true);
    
    const finalTitle = data.title.trim() || 'Novo Trabalho';
    const finalDate = data.date || null;

    const installmentsValue = (data.payment_type === 'ENTRADA_PARCELAS' || data.payment_type === 'PIX_PARCELADO' || data.payment_type === 'CARTAO_PARCELADO')
      ? (parseInt(data.installments || data.num_installments, 10) || null)
      : null;

    let statusToUse = data.status;
    if (!card) {
      statusToUse = initialStatus 
        || (data.date ? 'agendado' : (settings?.workflow_columns?.[0]?.id || 'novo-lead'));
    }

    const payload = {
      ...formData,
      ...data,
      user_id: user.id,
      title: finalTitle,
      date: finalDate,
      client_id: data.client_id || null,
      service_package_id: data.service_package_id || null,
      first_installment_date: data.first_installment_date || null,
      value: parseFloat(data.value) || null,
      entry_value: parseFloat(data.entry_value) || null,
      history: [{ action: "Criado", date: new Date().toISOString(), user: settings.user_name || user.email }],
      status: statusToUse,
      installments: installmentsValue,
      num_installments: installmentsValue,
      card_processing_days: (data.payment_type === 'CARTAO_CREDITO' || data.payment_type === 'CARTAO_PARCELADO') ? (parseInt(data.card_processing_days, 10) || null) : null,
      entry_paid: data.payment_type === 'ENTRADA_PARCELAS' ? data.entry_paid : (data.payment_type === 'INTEGRAL' ? data.entry_paid : false),
      subtasks: formData.subtasks.map(st => ({ text: st.text, completed: st.completed, id: st.id || Math.random().toString(36).substr(2, 9) })),
      main_wallet_id: data.main_wallet_id || null,
      entry_wallet_id: data.entry_wallet_id || null,
    };
    
    try {
      if (card && card.id) {
        await updateWorkflowCard(card.id, payload);
        toast({ title: "Sucesso!", description: `Card "${finalTitle}" atualizado.` });
      } else {
        await addWorkflowCard(payload);
        toast({ title: "Sucesso!", description: `Agendamento "${finalTitle}" criado.` });
      }
      localStorage.removeItem(DRAFT_KEY);
      await refreshData();
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Não foi possível salvar.",
        variant: "destructive",
        duration: 7000,
        action: (error.message.includes("required fields") || error.message.includes("obrigatórios")) ? (
          <Button variant="outline" size="sm" onClick={() => { setView('full'); setActiveTab('details'); }}>Verificar Campos</Button>
        ) : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCommentAndUpdateState = async (commentText) => {
    if (!card || !card.id) return;
    try {
      const updatedCard = await addComment(card.id, commentText);
      setFormData(prev => ({ ...prev, comments: updatedCard.comments, history: updatedCard.history }));
      toast({ title: "Comentário Adicionado" });
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleAddSubtask = (text) => setFormData(prev => ({ ...prev, subtasks: [...(prev.subtasks || []), { id: Math.random().toString(36).substr(2, 9), text, completed: false }] }));
  const handleToggleSubtask = (id) => setFormData(prev => ({ ...prev, subtasks: (prev.subtasks || []).map(t => t.id === id ? { ...t, completed: !t.completed } : t) }));
  const handleDeleteSubtask = (id) => setFormData(prev => ({ ...prev, subtasks: (prev.subtasks || []).filter(t => t.id !== id) }));
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="workflow-modal-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[5000]">
          <motion.div
            key="workflow-modal-content"
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-card/80 backdrop-blur-lg border border-border/50 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[95vh] z-[5001]"
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/50">
              <h2 className="text-xl font-semibold text-foreground">{card ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
              <Button variant="ghost" size="icon" onClick={handleCloseModal} className="w-9 h-9 rounded-full" disabled={isSubmitting}><X className="w-5 h-5" /></Button>
            </div>

            {view === 'full' && <WorkflowModalTabs activeTab={activeTab} setActiveTab={setActiveTab} cardId={card?.id} subtasksCount={formData.subtasks?.length} commentsCount={formData.comments?.length} />}

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
              {view === 'quick' && (
                <QuickCreateForm
                  initialData={formData}
                  onSave={handleSave}
                  onCancel={handleCloseModal}
                  onOpenClientModal={() => openClientModal('client', {})}
                  isSaving={isSubmitting}
                />
              )}
              {view === 'full' && activeTab === 'details' && (
                <WorkflowModalForm
                  card={formData}
                  onSave={handleSave}
                  onCancel={handleCloseModal}
                  isSaving={isSubmitting}
                />
              )}
              {view === 'full' && activeTab === 'subtasks' && <WorkflowModalSubtasks subtasks={formData.subtasks} onAddSubtask={handleAddSubtask} onToggleSubtask={handleToggleSubtask} onDeleteSubtask={handleDeleteSubtask} cardExists={!!card?.id} />}
              {view === 'full' && activeTab === 'comments' && <WorkflowModalComments comments={formData.comments} onAddComment={handleAddCommentAndUpdateState} cardExists={!!card?.id} onAfterComment={() => setActiveTab('comments')} />}
              {view === 'full' && activeTab === 'history' && card?.id && <WorkflowModalHistory history={formData.history} />}
            </div>

            {view === 'quick' ? (
                <div className="p-4 sm:p-5 border-t border-border/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
                    <Button type="button" variant="ghost" onClick={() => setView('full')} disabled={isSubmitting}>
                      Mais Opções <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <div>
                        <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isSubmitting} className="mr-2">Cancelar</Button>
                        <Button type="submit" form="quick-create-form" className="btn-custom-gradient text-white" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            {isSubmitting ? 'Salvando...' : (card ? 'Salvar' : 'Criar')}
                        </Button>
                    </div>
                </div>
            ) : (
                 <div className="p-4 sm:p-5 border-t border-border/50 flex items-center justify-end space-x-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
                    <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isSubmitting} className="mr-auto">Cancelar</Button>
                    <Button type="submit" form="workflow-form" className="btn-custom-gradient text-white" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isSubmitting ? 'Salvando...' : (card ? 'Salvar Alterações' : 'Salvar Agendamento')}
                    </Button>
                </div>
            )}
          </motion.div>
        </div>
      )}
      <ClientModal />
    </AnimatePresence>
  );
};

export default WorkflowModal;