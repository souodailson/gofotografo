import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </motion.div>
      <p className="mt-4 text-lg font-semibold text-foreground">Carregando...</p>
    </div>
  );
};

export default FullScreenLoader;