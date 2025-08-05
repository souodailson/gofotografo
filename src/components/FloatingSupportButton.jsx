import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, LifeBuoy, Lightbulb, X, Send, User, Mail as MailIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import useMobileLayout from '@/hooks/useMobileLayout';

const SupportWidgetForm = ({ type, onSubmit }) => {
  const { user, settings } = useData();
  const [name, setName] = useState(settings?.user_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'support' && (!name || !email || !message)) {
      alert('Por favor, preencha todos os campos obrigatórios para suporte.');
      return;
    }
    if (type === 'suggestion' && !message) {
      alert('Por favor, escreva sua sugestão.');
      return;
    }
    onSubmit({ type, name, email, message });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      {type === 'support' && (
        <>
          <div>
            <label htmlFor="support-name" className="block text-sm font-medium text-muted-foreground mb-1">Seu nome</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="support-name" type="text" placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} required className="pl-10" />
            </div>
          </div>
          <div>
            <label htmlFor="support-email" className="block text-sm font-medium text-muted-foreground mb-1">E-mail</label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="support-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
            </div>
          </div>
        </>
      )}
      {type === 'suggestion' && (
        <div>
          <label htmlFor="suggestion-email" className="block text-sm font-medium text-muted-foreground mb-1">E-mail (opcional)</label>
          <div className="relative">
            <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input id="suggestion-email" type="email" placeholder="seu@email.com (opcional)" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
          </div>
        </div>
      )}
      <div>
        <label htmlFor={`${type}-message`} className="block text-sm font-medium text-muted-foreground mb-1">
          {type === 'support' ? 'Mensagem' : 'Sua sugestão'}
        </label>
        <Textarea
          id={`${type}-message`}
          placeholder={type === 'support' ? 'Descreva seu problema ou dúvida...' : 'Como podemos melhorar?'}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={type === 'support' ? 4 : 5}
        />
      </div>
      <Button type="submit" className="w-full btn-custom-gradient text-white">
        <Send className="w-4 h-4 mr-2" />
        Enviar
      </Button>
    </form>
  );
};

const FloatingSupportButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('support'); 
  const { toast } = useToast();
  const widgetRef = useRef(null);
  const { isMobile } = useMobileLayout();

  const toggleWidget = () => setIsOpen(!isOpen);

  const handleFormSubmit = (formData) => {
    const { type, name, email, message } = formData;
    const recipientEmail = "suporte@gofotografo.com.br";
    let subject = "";
    let body = "";

    if (type === 'support') {
      subject = encodeURIComponent(`Solicitação de Suporte: ${name}`);
      body = encodeURIComponent(
        `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`
      );
    } else if (type === 'suggestion') {
      subject = encodeURIComponent(`Sugestão para GO.FOTÓGRAFO${email ? ` de ${email}` : ''}`);
      body = encodeURIComponent(
        `Email: ${email || 'Não informado'}\n\nSugestão:\n${message}`
      );
    }

    const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    
    try {
      window.open(mailtoLink, '_self');
      toast({
        title: "Abrindo seu app de e-mail...",
        description: `Sua ${type === 'support' ? 'solicitação de suporte' : 'sugestão'} está pronta para ser enviada.`,
      });
      setIsOpen(false);
    } catch (error) {
       toast({
        title: "Erro ao abrir app de e-mail",
        description: "Não foi possível abrir seu aplicativo de e-mail. Copie os detalhes e envie manualmente.",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        const fabButton = document.getElementById('floating-support-button');
        if (fabButton && !fabButton.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (isMobile) {
    return null; // Remove o botão flutuante no mobile
  }

  return (
    <div className="fixed bottom-8 right-8 z-[1000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={widgetRef}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            className="absolute bottom-20 right-0 w-80 bg-card shadow-2xl rounded-xl border border-border overflow-hidden"
          >
            <div className="p-4 border-b border-border">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-foreground">Fale Conosco</h3>
                <Button variant="ghost" size="icon" onClick={toggleWidget} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <Button
                  onClick={() => setActiveTab('support')}
                  className={cn(
                    "flex-1 h-9 text-sm transition-colors duration-150",
                    activeTab === 'support' 
                      ? "bg-background text-foreground shadow-sm hover:bg-background/90" 
                      : "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <LifeBuoy className="w-4 h-4 mr-2" /> Suporte
                </Button>
                <Button
                  onClick={() => setActiveTab('suggestion')}
                  className={cn(
                    "flex-1 h-9 text-sm transition-colors duration-150",
                    activeTab === 'suggestion' 
                      ? "bg-background text-foreground shadow-sm hover:bg-background/90" 
                      : "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Lightbulb className="w-4 h-4 mr-2" /> Sugestão
                </Button>
              </div>
            </div>
            
            <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin">
              {activeTab === 'support' && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Precisa de ajuda? Entre em contato conosco.</p>
                  <SupportWidgetForm type="support" onSubmit={handleFormSubmit} />
                </div>
              )}
              {activeTab === 'suggestion' && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Tem alguma ideia para melhorar o GO.FOTÓGRAFO? Adoramos ouvir suas sugestões!</p>
                  <SupportWidgetForm type="suggestion" onSubmit={handleFormSubmit} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        id="floating-support-button"
        onClick={toggleWidget}
        className="w-16 h-16 bg-gradient-to-br from-customPurple to-customGreen text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir widget de suporte"
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
      </motion.button>
    </div>
  );
};

export default FloatingSupportButton;