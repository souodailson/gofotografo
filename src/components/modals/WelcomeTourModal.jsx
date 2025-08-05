import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog.jsx";
import { Sparkles, X } from 'lucide-react';

const WelcomeTourModal = ({ isOpen, onClose, onStartTour, onDeclineTour }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <AlertDialogContent 
            className="bg-card/80 dark:bg-card/70 backdrop-blur-xl border-border shadow-2xl rounded-lg p-0 max-w-md"
            
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-6"
            >
              <AlertDialogHeader className="text-center mb-4">
                <div className="flex justify-center items-center mb-3">
                  <Sparkles className="w-12 h-12 text-customPurple dark:text-customGreen" />
                </div>
                <AlertDialogTitle className="text-2xl font-bold text-foreground">
                  Bem-vindo(a) ao GO.FOTÓGRAFO!
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground mt-2 text-base">
                  Quer fazer um tour rápido pela plataforma para conhecer as principais funcionalidades?
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button 
                  onClick={onDeclineTour} 
                  variant="outline" 
                  className="w-full sm:w-auto border-primary/30 hover:bg-primary/5 text-primary dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/5 dark:text-primary-foreground"
                >
                  Não, obrigado(a).
                </Button>
                <Button 
                  onClick={onStartTour} 
                  className="w-full sm:w-auto btn-custom-gradient text-white shadow-lg hover:opacity-90"
                >
                  Sim, vamos lá!
                </Button>
              </AlertDialogFooter>
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AnimatePresence>
  );
};

export default WelcomeTourModal;