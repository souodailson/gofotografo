import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TicketItem = ({ ticket, onSelect, isSelected }) => {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'aberto': return 'warning';
      case 'fechado': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div
      className={cn(
        "p-4 border rounded-lg cursor-pointer transition-all duration-200",
        isSelected ? "bg-muted border-primary" : "hover:bg-muted/50"
      )}
      onClick={() => onSelect(ticket.id)}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-sm text-foreground">{ticket.assunto || 'Sugestão'}</p>
          <p className="text-xs text-muted-foreground">Protocolo: {ticket.protocolo}</p>
        </div>
        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: ptBR })}
        </p>
        {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
    </div>
  );
};

export default TicketItem;