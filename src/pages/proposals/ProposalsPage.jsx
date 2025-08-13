import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Share2, Eye, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazyImage from '@/components/common/LazyImage';
import { useData } from '@/contexts/DataContext';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
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
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import PreviewModal from '@/pages/proposals/components/PreviewModal';
import { supabase } from '@/lib/supabaseClient';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const nichePlaceholders = {
  default: 'https://images.unsplash.com/photo-1511285560921-5ae97c6abc7c?q=80&w=1280&auto=format&fit=crop',
  casamento: 'https://images.unsplash.com/photo-1597158269292-6f811526f7c5?q=80&w=1280&auto=format&fit=crop',
  gestante: 'https://images.unsplash.com/photo-1594895185918-a834162985ce?q=80&w=1280&auto=format&fit=crop',
  aniversario: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1280&auto=format&fit=crop',
  ensaio: 'https://images.unsplash.com/photo-1500336996925-4201b1a565c6?q=80&w=1280&auto=format&fit=crop',
  corporativo: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1280&auto=format&fit=crop',
};

const ProposalCard = ({ proposal, onShare, onDelete, onPreview }) => {
  const { getClientById } = useData();
  const navigate = useNavigate();
  const client = proposal.client_id ? getClientById(proposal.client_id) : null;

  const getCoverImage = () => {
    if (proposal.thumbnail_url) return proposal.thumbnail_url;
    
    // Attempt to guess niche from client tags or proposal name
    const clientNiche = client?.tags?.find(tag => nichePlaceholders[tag.toLowerCase()]);
    if (clientNiche) return nichePlaceholders[clientNiche.toLowerCase()];

    const proposalNiche = Object.keys(nichePlaceholders).find(key => 
      proposal.nome_da_proposta.toLowerCase().includes(key)
    );
    if (proposalNiche) return nichePlaceholders[proposalNiche];
    
    return nichePlaceholders.default;
  };

  const coverImage = getCoverImage();
  const isIllustrative = !proposal.thumbnail_url;

  const handleCardClick = (e) => {
    e.stopPropagation();
    onPreview(proposal);
  };

  const handleButtonClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      layout
      className="relative aspect-[9/16] w-full overflow-hidden rounded-xl shadow-lg group cursor-pointer"
      onClick={handleCardClick}
    >
      <LazyImage src={coverImage} alt={proposal.nome_da_proposta} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      
      {isIllustrative && (
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
            <AlertTriangle className="h-3 w-3" />
            Capa ilustrativa
          </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-lg font-bold truncate">{proposal.nome_da_proposta}</h3>
        <p className="text-sm text-white/80 truncate">
          {client ? `Cliente: ${client.name}` : 'Sem cliente vinculado'}
        </p>
        
        <div className="mt-3 space-y-1 text-xs text-white/70">
          <div className="flex justify-between items-center">
            <span>Criação:</span>
            <span>{format(new Date(proposal.created_at), "dd/MM/yy", { locale: ptBR })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Status:</span>
            <Badge 
              variant={proposal.is_published ? "success" : "secondary"}
              className={cn(
                "text-xs px-2 py-0.5",
                proposal.is_published ? "bg-green-500/80 text-white" : "bg-gray-500/80 text-white"
              )}
            >
              {proposal.is_published ? "Publicada" : "Rascunho"}
            </Badge>
          </div>
        </div>

        <div className="mt-4 flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/20 hover:text-white rounded-full" onClick={(e) => handleButtonClick(e, () => onShare(proposal.id))}>
            <Share2 className="h-4 w-4" />
          </Button>
          {/* View using nested route */}
          <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/20 hover:text-white rounded-full" onClick={(e) => handleButtonClick(e, () => navigate(`/studio/proposals/view/${proposal.id}`))}>
            <Eye className="h-4 w-4" />
          </Button>
          {/* Edit using nested route */}
          <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/20 hover:text-white rounded-full" onClick={(e) => handleButtonClick(e, () => navigate(`/studio/proposals/edit/${proposal.id}`))}>
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-full" onClick={(e) => handleButtonClick(e, () => {})}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente a proposta.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(proposal.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.div>
  );
};

const TemplateCard = ({ template, onSelect }) => {
    const getCoverImage = () => {
        if (template.thumbnail_url) return template.thumbnail_url;
        const nicheKey = template.category?.toLowerCase();
        if (nicheKey && nichePlaceholders[nicheKey]) {
            return nichePlaceholders[nicheKey];
        }
        return nichePlaceholders.default;
    };
    const coverImage = getCoverImage();
  
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-lg group cursor-pointer"
        onClick={() => onSelect(template.id)}
      >
        <LazyImage src={coverImage} alt={template.template_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
            <Button>Usar este modelo</Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-base font-bold truncate">{template.template_name}</h3>
          {template.category && <Badge variant="secondary" className="text-xs mt-1">{template.category}</Badge>}
        </div>
      </motion.div>
    );
};

const ProposalsPage = () => {
  const { proposals, refreshData, deleteProposal, getClientById } = useData();
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [view, setView] = useState('proposals'); // 'proposals' or 'templates'
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
        refreshData('proposals'),
        (async () => {
            const { data, error } = await supabase.from('proposal_templates').select('*').eq('is_public', true);
            if (error) {
                toast({ title: "Erro ao buscar modelos", description: error.message, variant: "destructive" });
            } else {
                setTemplates(data || []);
            }
        })()
    ]);
    setLoading(false);
  }, [refreshData, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleSelectTemplate = (templateId) => {
    navigate(`/studio/proposals/new?templateId=${templateId}`);
  };

  const handleShare = (proposalId) => {
    const url = `${window.location.origin}/studio/proposals/view/${proposalId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copiado!",
      description: "O link da proposta foi copiado para a área de transferência.",
    });
  };

  const handleDelete = async (proposalId) => {
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

  const handlePreview = (proposal) => {
    setSelectedProposal(proposal);
  };
  
  const handleNewProposalClick = () => {
    if (templates.length > 0) {
      setView('templates');
    } else {
      navigate('/studio/proposals/new');
    }
  };
  
  const renderProposalList = () => (
    <>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">GO.STUDIO</h1>
            <Button onClick={handleNewProposalClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Proposta
            </Button>
        </div>
        {proposals && proposals.length > 0 ? (
            <motion.div layout className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              <AnimatePresence>
                {proposals.map((proposal) => (
                    <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    onShare={handleShare}
                    onDelete={handleDelete}
                    onPreview={handlePreview}
                    />
                ))}
              </AnimatePresence>
            </motion.div>
        ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-lg flex flex-col items-center">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">Nenhuma proposta criada ainda</h2>
                <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
                    Crie propostas incríveis e personalizadas para encantar seus clientes e fechar mais negócios.
                </p>
                <Button size="lg" onClick={handleNewProposalClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar minha primeira proposta
                </Button>
            </div>
        )}
    </>
  );

  const renderTemplateSelection = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Escolha um Modelo</h1>
        <div>
          <Button variant="outline" onClick={() => setView('proposals')} className="mr-2">Voltar</Button>
        <Button onClick={() => navigate('/studio/proposals/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Começar do Zero
          </Button>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {templates.map((template) => (
            <TemplateCard key={template.id} template={template} onSelect={handleSelectTemplate} />
        ))}
      </div>
    </>
  );

  if (loading) {
     return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="aspect-[9/16] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
            <motion.div
                key={view}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
            >
                {view === 'proposals' ? renderProposalList() : renderTemplateSelection()}
            </motion.div>
        </AnimatePresence>
      
      {selectedProposal && (
        <PreviewModal
          isOpen={!!selectedProposal}
          onClose={() => setSelectedProposal(null)}
          proposalData={{...selectedProposal.dados_json, nome_da_proposta: selectedProposal.nome_da_proposta, client: getClientById(selectedProposal.client_id) }}
        />
      )}
    </div>
  );
};

export default ProposalsPage;
