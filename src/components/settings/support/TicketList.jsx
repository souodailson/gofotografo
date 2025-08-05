import React from 'react';
import TicketItem from './TicketItem';
import TicketDetails from './TicketDetails';

const TicketList = ({ tickets, selectedTicketId, onSelectTicket, messages, onSendMessage, isSendingMessage, messageSenders }) => {
  if (tickets.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Você ainda não abriu nenhum chamado.</p>;
  }

  return (
    <div className="space-y-2">
      {tickets.map(ticket => (
        <div key={ticket.id}>
          <TicketItem 
            ticket={ticket} 
            onSelect={onSelectTicket} 
            isSelected={selectedTicketId === ticket.id} 
          />
          {selectedTicketId === ticket.id && (
            <TicketDetails
              ticket={ticket}
              messages={messages[ticket.id] || []}
              onSendMessage={onSendMessage}
              isSending={isSendingMessage}
              messageSenders={messageSenders}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default TicketList;