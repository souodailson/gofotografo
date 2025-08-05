import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, Lightbulb, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SupportForm from '@/components/settings/support/SupportForm';
import TicketList from '@/components/settings/support/TicketList';

const SupportSettings = () => {
  const { user } = useData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('new');
  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState({});
  const [messageSenders, setMessageSenders] = useState({});
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('suporte_chamados')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Erro ao buscar chamados", description: error.message, variant: "destructive" });
    } else {
      setTickets(data);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const fetchMessagesAndSenders = async (ticketId) => {
    const { data: messagesData, error: messagesError } = await supabase
      .from('suporte_mensagens')
      .select('*')
      .eq('chamado_id', ticketId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      toast({ title: "Erro ao buscar mensagens", description: messagesError.message, variant: "destructive" });
      return;
    }
    
    setMessages(prev => ({ ...prev, [ticketId]: messagesData }));

    const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
    if (senderIds.length > 0) {
      const { data: sendersData, error: sendersError } = await supabase
          .from('settings')
          .select('user_id, user_name, profile_photo')
          .in('user_id', senderIds);
          
      if (sendersError) {
        toast({ title: "Erro ao buscar dados dos remetentes", description: sendersError.message, variant: "destructive" });
      } else {
          const sendersMap = sendersData.reduce((acc, sender) => {
              acc[sender.user_id] = sender;
              return acc;
          }, {});
          setMessageSenders(prev => ({...prev, ...sendersMap}));
      }
    }
  };

  const handleSelectTicket = (ticketId) => {
    if (selectedTicketId === ticketId) {
      setSelectedTicketId(null);
    } else {
      setSelectedTicketId(ticketId);
      if (!messages[ticketId]) {
        fetchMessagesAndSenders(ticketId);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const protocolo = `GO-${Date.now()}`;
      const { data: ticketData, error: ticketError } = await supabase
        .from('suporte_chamados')
        .insert({
          user_id: user.id,
          protocolo,
          tipo: formData.type,
          assunto: formData.subject,
          status: 'aberto',
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      const { error: messageError } = await supabase
        .from('suporte_mensagens')
        .insert({
          chamado_id: ticketData.id,
          sender_id: user.id,
          sender_role: 'user',
          mensagem: formData.message,
        });

      if (messageError) throw messageError;

      toast({ title: "Enviado com sucesso!", description: `Seu protocolo é ${protocolo}.` });
      await fetchTickets();
      setActiveTab('history');
    } catch (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (ticketId, message) => {
    if (!user) return;
    setIsSendingMessage(true);
    try {
      const { error } = await supabase
        .from('suporte_mensagens')
        .insert({
          chamado_id: ticketId,
          sender_id: user.id,
          sender_role: 'user',
          mensagem: message,
        });
      if (error) throw error;
      await fetchMessagesAndSenders(ticketId);
    } catch (error) {
      toast({ title: "Erro ao enviar mensagem", description: error.message, variant: "destructive" });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const renderContent = () => {
    if (activeTab === 'new') {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Abrir Novo Chamado</CardTitle>
            <CardDescription>Precisa de ajuda ou tem uma sugestão? Nos diga aqui.</CardDescription>
          </CardHeader>
          <CardContent>
            <SupportForm type="support" onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
          </CardContent>
        </Card>
      );
    }
    if (activeTab === 'suggestion') {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Enviar Sugestão</CardTitle>
            <CardDescription>Adoramos ouvir suas ideias para melhorar o GO.FOTÓGRAFO!</CardDescription>
          </CardHeader>
          <CardContent>
            <SupportForm type="suggestion" onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
          </CardContent>
        </Card>
      );
    }
    if (activeTab === 'history') {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Chamados</CardTitle>
            <CardDescription>Acompanhe suas solicitações e sugestões.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" /> : (
              <TicketList
                tickets={tickets}
                selectedTicketId={selectedTicketId}
                onSelectTicket={handleSelectTicket}
                messages={messages}
                onSendMessage={handleSendMessage}
                isSendingMessage={isSendingMessage}
                messageSenders={messageSenders}
              />
            )}
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
      <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-4">
        <Button
          onClick={() => setActiveTab('new')}
          className={cn("flex-1 h-9 text-sm", activeTab === 'new' ? "bg-background text-foreground shadow-sm" : "bg-transparent text-muted-foreground")}
        >
          <LifeBuoy className="w-4 h-4 mr-2" /> Novo Suporte
        </Button>
        <Button
          onClick={() => setActiveTab('suggestion')}
          className={cn("flex-1 h-9 text-sm", activeTab === 'suggestion' ? "bg-background text-foreground shadow-sm" : "bg-transparent text-muted-foreground")}
        >
          <Lightbulb className="w-4 h-4 mr-2" /> Sugestão
        </Button>
        <Button
          onClick={() => setActiveTab('history')}
          className={cn("flex-1 h-9 text-sm", activeTab === 'history' ? "bg-background text-foreground shadow-sm" : "bg-transparent text-muted-foreground")}
        >
          <MessageSquare className="w-4 h-4 mr-2" /> Meus Chamados
        </Button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default SupportSettings;