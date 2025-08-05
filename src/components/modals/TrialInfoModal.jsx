import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Info } from 'lucide-react';

const TrialInfoModal = ({ isOpen, onClose, onUpgradeClick, daysRemaining }) => {
  if (!isOpen) return null;

  const message = daysRemaining > 1 
    ? `Restam ${daysRemaining} dias para você aproveitar todas as funcionalidades.`
    : daysRemaining === 1
    ? `Seu período de teste termina hoje! Não perca o acesso.`
    : `Seu período de teste expirou. Considere fazer um upgrade.`;

  return (
    <div className="modal-overlay-unified z-[9990]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 30 }}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        className="relative bg-card text-card-foreground rounded-xl shadow-2xl w-full max-w-md p-6 md:p-8 border border-border"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar modal"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Info className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">
            Você está em um Período de Teste
          </h2>
          <p className="text-muted-foreground text-md mb-6">
            {message}
          </p>

          <div className="w-full space-y-3">
            <Button
              onClick={() => {
                onUpgradeClick();
                onClose();
              }}
              size="lg"
              className="w-full btn-custom-gradient text-white font-semibold py-3 text-md shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Fazer Upgrade Agora
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="lg"
              className="w-full text-muted-foreground hover:bg-muted/50"
            >
              Continuar Testando
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TrialInfoModal;