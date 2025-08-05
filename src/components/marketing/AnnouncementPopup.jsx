import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const AnnouncementPopup = () => {
  const [anuncio, setAnuncio] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchAnuncio = async () => {
      try {
        const { data, error } = await supabase
          .from('anuncios')
          .select('*')
          .eq('esta_ativo', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const latestAnuncio = data[0];
          const lastClosedTimestamp = localStorage.getItem(`anuncio_closed_${latestAnuncio.id}`);
          const cooldownMinutes = latestAnuncio.cooldown_reaparicao_minutos || 60;
          
          if (lastClosedTimestamp) {
            const cooldownMs = cooldownMinutes * 60 * 1000;
            const timeSinceClosed = Date.now() - parseInt(lastClosedTimestamp, 10);
            if (timeSinceClosed < cooldownMs) {
              return;
            }
          }
          setAnuncio(latestAnuncio);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Erro ao buscar anúncio:", error);
      }
    };

    fetchAnuncio();
  }, []);

  useEffect(() => {
    if (isVisible && anuncio && anuncio.duracao_exibicao_segundos > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, anuncio.duracao_exibicao_segundos * 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, anuncio]);

  const handleClose = () => {
    setIsVisible(false);
    if (anuncio) {
      localStorage.setItem(`anuncio_closed_${anuncio.id}`, Date.now().toString());
    }
  };

  const handleLinkClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      handleClose();
    }
  };

  if (!anuncio) return null;

  const positionClasses = {
    'top-left': 'items-start justify-start',
    'top-center': 'items-start justify-center',
    'top-right': 'items-start justify-end',
    'center': 'items-center justify-center',
    'bottom-left': 'items-end justify-start',
    'bottom-center': 'items-end justify-center',
    'bottom-right': 'items-end justify-end',
  };

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "fixed inset-0 z-[9999] flex p-4 bg-black/30 backdrop-blur-sm",
            positionClasses[anuncio.posicao_anuncio] || positionClasses.center
          )}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className={cn("shadow-2xl w-full", sizeClasses[anuncio.tamanho_anuncio] || sizeClasses.medium)}>
              <button onClick={handleClose} className="absolute top-2 right-2 p-1 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-10">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </button>
              {anuncio.imagem_url && (
                <div className="cursor-pointer" onClick={() => handleLinkClick(anuncio.link_imagem)}>
                  <img src={anuncio.imagem_url} alt={anuncio.titulo_anuncio} className="w-full h-auto object-cover rounded-t-lg" />
                </div>
              )}
              <CardHeader>
                <CardTitle>{anuncio.titulo_anuncio}</CardTitle>
                {anuncio.conteudo_anuncio && <CardDescription>{anuncio.conteudo_anuncio}</CardDescription>}
              </CardHeader>
              {anuncio.link_botao && (
                <CardFooter>
                  <Button className="w-full" onClick={() => handleLinkClick(anuncio.link_botao)}>
                    Saiba Mais
                  </Button>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementPopup;