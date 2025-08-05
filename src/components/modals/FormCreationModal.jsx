import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, FilePlus, UserPlus, ClipboardList, Megaphone, MessageSquare as MessageSquareQuote } from 'lucide-react';
import useCardHoverEffect from '@/hooks/useCardHoverEffect';

const TemplateCard = ({ icon: Icon, title, description, onClick }) => {
  const cardRef = useCardHoverEffect();
  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={onClick}
      className="bg-card rounded-xl p-6 shadow-lg border border-border card-hover-effect flex flex-col items-center text-center cursor-pointer"
    >
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground flex-grow">{description}</p>
    </motion.div>
  );
};

const FormCreationModal = ({ isOpen, onClose, onSelectTemplate }) => {
  const templates = [
    {
      type: 'client_registration',
      icon: UserPlus,
      title: 'Cadastro de Cliente',
      description: 'Ideal para coletar informações básicas de novos clientes de forma rápida e direta.'
    },
    {
      type: 'client_and_briefing',
      icon: ClipboardList,
      title: 'Cadastro + Briefing',
      description: 'Combine o cadastro do cliente com um briefing detalhado para entender suas necessidades.'
    },
    {
      type: 'lead_campaign',
      icon: Megaphone,
      title: 'Campanha de Leads',
      description: 'Capture contatos de potenciais clientes para suas campanhas de marketing.'
    },
    {
      type: 'feedback',
      icon: MessageSquareQuote,
      title: 'Pesquisa de Feedback',
      description: 'Receba feedbacks construtivos dos seus clientes para melhorar seus serviços.'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[5000]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-background rounded-2xl p-8 w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col relative"
          >
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 text-muted-foreground"><X /></Button>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground">Criar Novo Formulário</h2>
              <p className="text-muted-foreground mt-2">Escolha um modelo para começar ou crie um do zero.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 overflow-y-auto pr-2 scrollbar-thin">
              <TemplateCard
                icon={FilePlus}
                title="Começar do Zero"
                description="Crie um formulário totalmente personalizado, adicionando suas próprias perguntas."
                onClick={() => onSelectTemplate('blank')}
              />
              {templates.map(template => (
                <TemplateCard
                  key={template.type}
                  icon={template.icon}
                  title={template.title}
                  description={template.description}
                  onClick={() => onSelectTemplate(template.type)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FormCreationModal;