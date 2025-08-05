import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Mail, User as UserIcon, LifeBuoy, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AdminSupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageSenders, setMessageSenders] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const { user: adminUser } = useData();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('suporte_chamados')
      .select('*')
      .order('created_at', { ascending: false });

    if (ticketsError) {
      toast({ title: "Erro ao buscar chamados", description: ticketsError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const userIds = [...new Set(ticketsData.map(t => t.user_id))];
    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabase
        .from('settings')
        .select('user_id, user_name, contact_email, profile_photo')
        .in('user_id', userIds);

      if (usersError) {
        toast({ title: "Erro ao buscar informações dos usuários", description: usersError.message, variant: "destructive" });
      } else {
        const usersMap = usersData.reduce((acc, user) => {
          acc[user.user_id] = user;
          return acc;
        }, {});

        const enrichedTickets = ticketsData.map(ticket => ({
          ...ticket,
          user_info: usersMap[ticket.user_id] || { user_name: 'Usuário Desconhecido', contact_email: 'N/A', profile_photo: null }
        }));
        setTickets(enrichedTickets);
      }
    } else {
      setTickets(ticketsData);
    }

    setLoading(false);
  }, [toast]);

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
    
    setMessages(messagesData);

    const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
    if (senderIds.length > 0) {
        const { data: sendersData, error: sendersError } = await supabase
            .from('settings')
            .select('user_id, user_name, profile_photo')
            .in('user_id', senderIds);
            
        if (sendersError) {
          console.error("Erro ao buscar dados dos remetentes:", sendersError);
        } else {
            const sendersMap = sendersData.reduce((acc, sender) => {
                acc[sender.user_id] = sender;
                return acc;
            }, {});
            setMessageSenders(prev => ({...prev, ...sendersMap}));
        }
    }
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setMessages([]);
    fetchMessagesAndSenders(ticket.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const { data, error } = await supabase
        .from('suporte_mensagens')
        .insert({
          chamado_id: selectedTicket.id,
          sender_id: adminUser.id,
          sender_role: 'admin',
          mensagem: newMessage,
        })
        .select()
        .single();
      if (error) throw error;
      
      await fetchMessagesAndSenders(selectedTicket.id);
      setNewMessage('');
    } catch (error) {
      toast({ title: "Erro ao enviar mensagem", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    const { error } = await supabase
      .from('suporte_chamados')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    if (error) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status atualizado com sucesso!" });
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
    }
  };

  const getStatusVariant = (status) => {
    return status === 'aberto' ? 'warning' : 'success';
  };

  const openTickets = tickets.filter(t => t.status === 'aberto');
  const closedTickets = tickets.filter(t => t.status === 'fechado');

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-bold mb-4">Central de Suporte</h1>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        <div className="md:col-span-1 flex flex-col h-full">
          <Tabs defaultValue="abertos" className="flex-grow flex flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="abertos" className="flex-1">Abertos ({openTickets.length})</TabsTrigger>
              <TabsTrigger value="fechados" className="flex-1">Fechados ({closedTickets.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="abertos" className="flex-grow mt-0">
              <TicketList tickets={openTickets} onSelectTicket={handleSelectTicket} selectedTicketId={selectedTicket?.id} loading={loading} />
            </TabsContent>
            <TabsContent value="fechados" className="flex-grow mt-0">
              <TicketList tickets={closedTickets} onSelectTicket={handleSelectTicket} selectedTicketId={selectedTicket?.id} loading={loading} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="md:col-span-2 h-full">
          <TicketDetails
            ticket={selectedTicket}
            messages={messages}
            messageSenders={messageSenders}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={handleSendMessage}
            onStatusChange={handleStatusChange}
            sending={sending}
            adminUserId={adminUser.id}
            getStatusVariant={getStatusVariant}
          />
        </div>
      </div>
    </div>
  );
};

const TicketList = ({ tickets, onSelectTicket, selectedTicketId, loading }) => (
  <Card className="h-full flex flex-col">
    <CardContent className="p-2 flex-grow">
      <ScrollArea className="h-[calc(100vh-220px)]">
        {loading ? (
          <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : tickets.length > 0 ? (
          <div className="space-y-2">
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className={cn(
                  "p-3 rounded-lg cursor-pointer border transition-colors",
                  selectedTicketId === ticket.id ? "bg-muted border-primary" : "hover:bg-muted/50"
                )}
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-sm truncate">{ticket.assunto || 'Sugestão'}</p>
                  {ticket.tipo === 'suporte' ? <LifeBuoy className="h-4 w-4 text-blue-500" /> : <Lightbulb className="h-4 w-4 text-yellow-500" />}
                </div>
                <p className="text-xs text-muted-foreground">De: {ticket.user_info?.user_name || 'Usuário desconhecido'}</p>
                <p className="text-xs text-muted-foreground">Protocolo: {ticket.protocolo}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(ticket.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-muted-foreground">Nenhum chamado aqui.</div>
        )}
      </ScrollArea>
    </CardContent>
  </Card>
);

const TicketDetails = ({ ticket, messages, messageSenders, newMessage, setNewMessage, onSendMessage, onStatusChange, sending, adminUserId, getStatusVariant }) => {
  if (!ticket) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Selecione um chamado para ver os detalhes.</p>
        </div>
      </Card>
    );
  }
  
  const getSenderAvatar = (senderId, senderRole) => {
    if(senderRole === 'admin') {
      return (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <LifeBuoy className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      );
    }
    const sender = messageSenders[senderId];
    return (
      <Avatar className="h-8 w-8">
        <AvatarImage src={sender?.profile_photo} alt={sender?.user_name} />
        <AvatarFallback>{sender?.user_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {ticket.tipo === 'suporte' ? <LifeBuoy className="h-5 w-5 text-blue-500" /> : <Lightbulb className="h-5 w-5 text-yellow-500" />}
              {ticket.assunto || 'Sugestão'}
            </CardTitle>
            <CardDescription>Protocolo: {ticket.protocolo}</CardDescription>
          </div>
          <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
        </div>
        <div className="text-sm text-muted-foreground space-y-1 pt-2">
          <p className="flex items-center"><UserIcon className="w-4 h-4 mr-2" /> {ticket.user_info?.user_name || 'Usuário desconhecido'}</p>
          <p className="flex items-center"><Mail className="w-4 h-4 mr-2" /> {ticket.user_info?.contact_email || 'E-mail não informado'}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 flex flex-col">
        <ScrollArea className="flex-grow p-4">
          <div className="space-y-4">
            {messages.map(msg => {
              const isAdmin = msg.sender_role === 'admin';
              const sender = messageSenders[msg.sender_id];
              return (
                <div key={msg.id} className={cn("flex items-end gap-2", isAdmin ? "flex-row-reverse" : "flex-row")}>
                  {getSenderAvatar(msg.sender_id, msg.sender_role)}
                  <div className="flex flex-col gap-1">
                      <div className={cn("p-3 rounded-lg max-w-lg", isAdmin ? "bg-primary text-primary-foreground" : "bg-muted")}>
                        <p className="text-sm whitespace-pre-wrap">{msg.mensagem}</p>
                      </div>
                      <p className={cn("text-xs text-muted-foreground", isAdmin ? "text-right" : "text-left")}>
                         {isAdmin ? 'Você' : sender?.user_name || 'Usuário'} - {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          {ticket.status === 'aberto' ? (
            <form onSubmit={onSendMessage} className="space-y-2">
              <Textarea
                placeholder="Digite sua resposta..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
              />
              <div className="flex justify-between items-center">
                <Button type="submit" disabled={sending}>
                  {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Enviar Resposta
                </Button>
                <Button variant="outline" onClick={() => onStatusChange(ticket.id, 'fechado')}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Marcar como Resolvido
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onStatusChange(ticket.id, 'aberto')}>
                <XCircle className="w-4 h-4 mr-2" /> Reabrir Chamado
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSupportPage;