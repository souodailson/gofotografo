import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileSignature } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const RecentContractItem = ({ icon, title, subtitle, date, statusVariant, statusText, onClick }) => (
  <motion.div
    variants={cardVariants}
    className="bg-card/50 dark:bg-card/40 backdrop-blur-sm border border-border/20 rounded-lg p-3 flex items-center gap-3 hover:bg-muted/30 cursor-pointer transition-colors"
    onClick={onClick}
  >
    <div className="p-2 bg-primary/10 rounded-lg">
      {icon}
    </div>
    <div className="flex-grow">
      <h4 className="font-semibold truncate text-sm">{title}</h4>
      <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })}</p>
      <Badge variant={statusVariant} className="mt-1 text-xs">{statusText}</Badge>
    </div>
  </motion.div>
);

const RecentContracts = ({ contracts, getClientById }) => {
  const navigate = useNavigate();

  const getContractStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'assinado': return 'success';
      case 'pendente': return 'warning';
      case 'recusado': return 'destructive';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  const handleContractClick = (contract) => {
    navigate(`/contracts/editor/${contract.id}`);
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-4 flex items-center"><FileSignature className="w-6 h-6 mr-3 text-primary" /> Contratos Recentes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contracts.length > 0 ? (
          contracts.map((c) => (
            <RecentContractItem
              key={c.id}
              icon={<FileSignature className="w-5 h-5 text-primary" />}
              title={c.titulo_contrato}
              subtitle={`Cliente: ${getClientById(c.id_cliente)?.name || 'N/A'}`}
              date={c.data_geracao}
              statusVariant={getContractStatusVariant(c.status_assinatura)}
              statusText={c.status_assinatura || 'Rascunho'}
              onClick={() => handleContractClick(c)}
            />
          ))
        ) : (
          <p className="text-muted-foreground p-4 text-center border-dashed border rounded-lg md:col-span-2">Nenhum contrato recente.</p>
        )}
      </div>
    </div>
  );
};

export default RecentContracts;