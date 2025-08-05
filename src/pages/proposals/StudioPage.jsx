import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

import StudioHeader from '@/pages/proposals/components/studio/StudioHeader';
import RecentProposals from '@/pages/proposals/components/studio/RecentProposals';
import RecentContracts from '@/pages/proposals/components/studio/RecentContracts';
import CreateContractModal from '@/pages/proposals/components/studio/CreateContractModal';
import TemplateGalleryModal from '@/pages/proposals/components/studio/TemplateGalleryModal';

const StudioPage = () => {
  const navigate = useNavigate();
  const { user, proposals, contratos, getClientById, refreshData, deleteProposal } = useData();
  const { toast } = useToast();

  const [isCreateContractModalOpen, setIsCreateContractModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [contractTemplates, setContractTemplates] = useState([]);
  
  const handleComingSoon = () => {
    toast({
      title: "🚧 Em breve!",
      description: "Esta funcionalidade ainda está em desenvolvimento. Fique de olho!",
    });
  };

  const handleCreateContract = async (type) => {
    setIsCreateContractModalOpen(false);
    if (type === 'blank') {
      navigate('/studio/contracts/new');
    } else if (type === 'template') {
       try {
        const { data, error } = await supabase
          .from('modeloscontrato')
          .select('*')
          .or('status.eq.publico', `user_id.eq.${user.id}`);
        
        if(error) throw error;
        
        setContractTemplates(data);
        setIsTemplateModalOpen(true);
      } catch (error) {
        toast({ title: "Erro", description: `Não foi possível carregar os modelos de contrato: ${error.message}`, variant: "destructive" });
      }
    }
  };

  const handleUseTemplate = async (template) => {
    setIsTemplateModalOpen(false);
    try {
        const { data, error } = await supabase
          .from('contratosgerados')
          .insert({ 
            id_fotografo: user.id, 
            id_modelo: template.id,
            titulo_contrato: `${template.nome_modelo} (Cópia)`, 
            conteudo_final: template.conteudo_template, 
            status_assinatura: 'draft',
          })
          .select('id')
          .single();
        if (error) throw error;
        await refreshData('contratos');
        navigate(`/studio/contracts/edit/${data.id}`);
    } catch (error) {
        toast({ title: 'Erro ao criar contrato do modelo', description: error.message, variant: 'destructive' });
    }
  };

  const handleShareProposal = (proposalId) => {
    const url = `${window.location.origin}/studio/view/${proposalId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copiado!",
      description: "O link da proposta foi copiado para a área de transferência.",
    });
  };

  const handleDeleteProposal = async (proposalId) => {
    try {
      await deleteProposal(proposalId);
      toast({
        title: "Proposta Excluída",
        description: "A proposta foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Excluir",
        description: "Não foi possível remover a proposta.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditProposal = (proposalId) => {
    navigate(`/studio/proposals/edit/${proposalId}`);
  };

  const sortedProposals = proposals.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  const sortedContracts = (contratos || []).sort((a, b) => new Date(b.data_geracao) - new Date(a.data_geracao)).slice(0, 4);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="p-4 sm:p-6"
    >
      <StudioHeader 
        onNewProposal={() => navigate('/studio/proposals/new')}
        onNewContract={() => setIsCreateContractModalOpen(true)}
        onViewTemplates={handleComingSoon}
      />

      <RecentProposals 
        proposals={sortedProposals}
        onShare={handleShareProposal}
        onDelete={handleDeleteProposal}
        onEdit={handleEditProposal}
      />

      <RecentContracts 
        contracts={sortedContracts}
        getClientById={getClientById}
      />
      
      <CreateContractModal
        isOpen={isCreateContractModalOpen}
        onOpenChange={setIsCreateContractModalOpen}
        onAction={handleCreateContract}
      />

      <TemplateGalleryModal
        isOpen={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
        templates={contractTemplates}
        onUseTemplate={handleUseTemplate}
      />
    </motion.div>
  );
};

export default StudioPage;