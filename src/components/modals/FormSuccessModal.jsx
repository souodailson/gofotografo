import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Copy, CheckCircle, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const FormSuccessModal = ({ isOpen, onClose, shareableLink }) => {
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast({
      title: "Link Copiado!",
      description: "O link do formulário foi copiado para a área de transferência.",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[5000]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-card rounded-2xl p-8 w-full max-w-md shadow-2xl text-center relative"
          >
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 text-muted-foreground"><X /></Button>
            
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="mx-auto bg-green-100 dark:bg-green-900/50 p-4 rounded-full w-fit mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>

            <h2 className="text-2xl font-bold text-foreground mb-3">Formulário Salvo!</h2>
            <p className="text-muted-foreground mb-6">Seu formulário está pronto para ser compartilhado com seus clientes.</p>
            
            <div className="bg-muted p-3 rounded-lg flex items-center justify-between mb-6">
              <Share2 className="w-5 h-5 text-muted-foreground mr-3" />
              <input 
                type="text"
                readOnly
                value={shareableLink}
                className="bg-transparent text-sm text-foreground flex-grow outline-none truncate"
              />
              <Button size="icon" variant="ghost" onClick={handleCopyLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <Button onClick={onClose} className="w-full">
              Fechar
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FormSuccessModal;