import React from 'react';
import { motion } from 'framer-motion';
import { DraftingCompass, FileSignature, SquareStack, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const ActionCard = ({ icon, title, description, buttonText, onClick, custom, comingSoon }) => {
  return (
    <motion.div
      variants={cardVariants}
      custom={custom}
      className="relative group bg-card/50 dark:bg-card/40 backdrop-blur-sm border border-border/20 rounded-2xl p-6 flex flex-col text-center items-center hover:border-primary/50 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
      <div className="relative z-10 flex flex-col items-center h-full">
        <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-lg font-bold mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 flex-grow">{description}</p>
        <Button onClick={onClick} className="w-full mt-auto" disabled={comingSoon}>
          {comingSoon ? "Em Breve" : buttonText}
          {!comingSoon && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </motion.div>
  );
};

const StudioHeader = ({ onNewProposal, onNewContract, onViewTemplates }) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">GO.STUDIO</h1>
        <p className="text-muted-foreground mt-2">Seu centro de criação para propostas e contratos profissionais.</p>
      </div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <ActionCard
          icon={<DraftingCompass className="w-8 h-8 text-primary" />}
          title="Nova Proposta"
          description="Crie propostas visuais e interativas para encantar seus clientes."
          buttonText="Começar a criar"
          onClick={onNewProposal}
          custom={0}
        />
        <ActionCard
          icon={<FileSignature className="w-8 h-8 text-primary" />}
          title="Novo Contrato"
          description="Gere contratos seguros e com validade jurídica em minutos."
          buttonText="Criar contrato"
          onClick={onNewContract}
          custom={1}
        />
        <ActionCard
          icon={<SquareStack className="w-8 h-8 text-primary" />}
          title="Templates"
          description="Use modelos prontos para agilizar a criação de propostas e contratos."
          buttonText="Ver modelos"
          onClick={onViewTemplates}
          custom={2}
          comingSoon
        />
      </motion.div>
    </>
  );
};

export default StudioHeader;