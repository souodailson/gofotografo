import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';

const FloatingActionButton = forwardRef(({ icon: Icon = Menu, onClick, id }, ref) => {
  return (
    <motion.button
      ref={ref}
      id={id}
      onClick={onClick}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-card/70 dark:bg-card/60 backdrop-blur-lg rounded-full shadow-xl border border-border/70 flex items-center justify-center text-primary dark:text-primary-foreground z-[500] fab-transition hover:scale-110 active:scale-95"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
      aria-label="Abrir menu de navegação"
    >
      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
    </motion.button>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';
export default FloatingActionButton;