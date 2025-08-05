import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LifeBuoy, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const TicketDetails = ({ ticket, messages, onSendMessage, isSending, messageSenders }) => {
  const { user } = useData();
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(ticket.id, newMessage);
    setNewMessage('');
  };
  
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
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-2 p-4 bg-muted/30 rounded-lg"
    >
      <ScrollArea className="h-64 pr-4">
        <div className="space-y-4">
          {messages.map(msg => {
             const isUser = msg.sender_id === user.id;
             return (
              <div key={msg.id} className={cn("flex items-end gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
                 {getSenderAvatar(msg.sender_id, msg.sender_role)}
                 <div className="flex flex-col gap-1">
                    <div className={cn("p-3 rounded-lg max-w-xs md:max-w-md", isUser ? "bg-primary text-primary-foreground" : "bg-background")}>
                      <p className="text-sm">{msg.mensagem}</p>
                    </div>
                    <p className={cn("text-xs text-muted-foreground", isUser ? "text-right" : "text-left")}>
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                 </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
      {ticket.status === 'aberto' && (
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua resposta..."
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending}>
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      )}
    </motion.div>
  );
};

export default TicketDetails;