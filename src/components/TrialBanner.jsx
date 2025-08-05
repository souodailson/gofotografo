import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Sparkles } from 'lucide-react';

const TrialBanner = ({ daysRemaining, onUpgradeClick }) => {
  if (daysRemaining === null || daysRemaining < 0) return null;

  const message = daysRemaining > 1 
    ? `Você está em um período de teste. Restam ${daysRemaining} dias.`
    : daysRemaining === 1
    ? `Seu período de teste termina hoje! Não perca o acesso.`
    : `Seu período de teste expirou.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="fixed top-0 left-0 right-0 z-[1000] bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white p-2.5 shadow-lg flex items-center justify-center text-sm"
    >
      <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />
      <span className="font-medium mr-3">{message}</span>
      <Button
        onClick={onUpgradeClick}
        size="sm"
        className="bg-white text-amber-600 hover:bg-gray-100 hover:text-amber-700 font-semibold py-1 px-3 rounded-md shadow transition-all duration-150 ease-in-out transform hover:scale-105"
      >
        <Sparkles className="w-4 h-4 mr-1.5" />
        Fazer Upgrade Agora
      </Button>
    </motion.div>
  );
};

export default TrialBanner;