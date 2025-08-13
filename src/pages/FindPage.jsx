import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/authContext';
import { FreelaProvider } from '@/contexts/FreelaContext';
import FreelaAuth from '@/components/freela/FreelaAuth';
import FreelaMain from '@/components/freela/FreelaMain';

const FindPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Se não há usuário autenticado, mostra a tela de auth
    if (!authLoading && !user) {
      setShowAuth(true);
    } else if (user) {
      setShowAuth(false);
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (showAuth) {
    return <FreelaAuth onAuthSuccess={() => setShowAuth(false)} />;
  }

  return (
    <FreelaProvider>
      <FreelaMain />
    </FreelaProvider>
  );
};

export default FindPage;