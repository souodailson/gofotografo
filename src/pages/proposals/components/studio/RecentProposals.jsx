import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, Eye, Edit, Trash2, Share2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

const nichePlaceholders = {
  default: 'https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//fundo%20liquid%20gofotografo%20wihtout%20grain%20-%20vertical.jpg',
  casamento: 'https://plus.unsplash.com/premium_photo-1675003662150-2569448d2b3b?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  gestante: 'https://images.unsplash.com/photo-1542286322-b1241fe63a5f?q=80&w=808&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  aniversario: 'https://images.unsplash.com/photo-1642005950606-dfa0b6f29d43?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  ensaio: 'https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//fundo%20liquid%20gofotografo%20wihtout%20grain%20-%20vertical.jpg',
  corporativo: 'https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//fundo%20liquid%20gofotografo%20wihtout%20grain%20-%20vertical.jpg',
};

const ProposalCoverCard = ({ proposal, onShare, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const { getClientById } = useData();
  const client = proposal.client_id ? getClientById(proposal.client_id) : null;

  const getCoverImage = () => {
    if (proposal.thumbnail_url) return proposal.thumbnail_url;
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
    onEdit(proposal.id);
  };

  const handleButtonClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  return (
    <motion.div
      variants={cardVariants}
      className="relative aspect-[3/4] w-72 flex-shrink-0 overflow-hidden rounded-2xl shadow-lg group cursor-pointer"
      onClick={handleCardClick}
    >
      <img src={coverImage} alt={proposal.nome_da_proposta} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      
      {isIllustrative && (
          <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
            <AlertTriangle className="h-3 w-3" />
            Capa ilustrativa
          </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-xl font-bold truncate">{proposal.nome_da_proposta}</h3>
        <p className="text-sm text-white/80 truncate">
          {client ? `Cliente: ${client.name}` : 'Sem cliente vinculado'}
        </p>
        <div className="mt-4 flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/20 hover:text-white rounded-full" onClick={(e) => handleButtonClick(e, () => onShare(proposal.id))}>
            <Share2 className="h-4 w-4" />
          </Button>
          {/* Visualizar usando rota nova */}
          <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/20 hover:text-white rounded-full" onClick={(e) => handleButtonClick(e, () => navigate(`/studio/proposals/view/${proposal.id}`))}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/20 hover:text-white rounded-full" onClick={(e) => handleButtonClick(e, () => onEdit(proposal.id))}>
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

const RecentProposals = ({ proposals, onShare, onDelete, onEdit }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 flex items-center"><Send className="w-6 h-6 mr-3 text-primary" /> Propostas Recentes</h2>
      {proposals.length > 0 ? (
        <div className="flex space-x-6 overflow-x-auto pb-4 -mx-6 px-6">
          {proposals.map((p) => (
            <ProposalCoverCard
              key={p.id}
              proposal={p}
              onShare={onShare}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground p-4 text-center border-dashed border rounded-lg">Nenhuma proposta recente.</p>
      )}
    </div>
  );
};

export default RecentProposals;
