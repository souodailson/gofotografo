import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const FeatureGuard = ({ featureName, children }) => {
  const { isFeatureEnabled } = useData();

  if (isFeatureEnabled(featureName)) {
    return children;
  }

  // Se a funcionalidade não estiver ativa, redireciona ou mostra uma mensagem.
  // Pode ser um redirecionamento para o dashboard ou uma página de "acesso negado".
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center p-8 bg-card rounded-xl"
    >
      <Lock className="w-16 h-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h1>
      <p className="text-muted-foreground">
        Esta funcionalidade não está habilitada para sua conta no momento.
      </p>
      <p className="text-muted-foreground mt-1">
        Por favor, contate o administrador do sistema para mais informações.
      </p>
    </motion.div>
  );
};

export default FeatureGuard;