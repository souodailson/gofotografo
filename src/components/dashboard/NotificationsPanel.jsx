import React from 'react';
import {
  PhoneOutgoing,
  X,
  BellRing,
  AlertTriangle,
  Clock,
  Gift,
  Sparkles,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Representa uma única notificação no painel.
 */
const NotificationItem = ({
  reminder,
  onDismiss,
  onFollowUp,
}) => {
  // Determina ícone e cor caso não venham do reminder
  const getIcon = () => {
    if (reminder.icon) return reminder.icon;
    const type = reminder.reminderType || reminder.type;
    switch (type) {
      case 'payment_overdue':
      case 'expense_overdue':
        return AlertTriangle;
      case 'payment_due':
      case 'expense_due':
        return Clock;
      case 'birthday':
        return Gift;
      case 'task_due':
        return Sparkles;
      default:
        return BellRing;
    }
  };
  const getColor = () => {
    const type = reminder.reminderType || reminder.type;
    if (type?.includes('overdue')) return 'bg-red-500';
    if (type?.includes('due')) return 'bg-yellow-500';
    if (type === 'birthday') return 'bg-pink-500';
    return 'bg-primary';
  };
  const IconComp = getIcon();
  const color = getColor();

  return (
    <div className="flex items-start space-x-3 p-4 border-b border-border/20 last:border-0 hover:bg-muted/30 transition-all duration-200">
      <div className={`p-2.5 rounded-full text-white shadow-md ${color}`}>
        <IconComp className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold mb-1 text-foreground leading-tight">
          {reminder.title}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {reminder.description}
        </p>
        {reminder.date && (
          <p className="text-xs text-muted-foreground/70 mt-1">
            {new Date(reminder.date).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-1">
        {reminder.clientPhone && (
          <button
            onClick={() => onFollowUp(reminder)}
            className="p-2 hover:bg-green-50 hover:text-green-600 rounded-full transition-all duration-200"
            title="Entrar em contato via WhatsApp"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/16566/16566143.png"
              alt="WhatsApp"
              className="w-4 h-4"
            />
          </button>
        )}
        <button
          onClick={() => onDismiss(reminder.id)}
          className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all duration-200"
          title="Dispensar notificação"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

/**
 * Painel de notificações inteligentes.
 * Adapta layout conforme quantidade de lembretes:
 * - 1 item: painel pequeno no canto direito.
 * - 2-4 itens: painel empilhado no canto direito.
 * - ≥5 itens: modal central com lista rolável.
 */
const NotificationsPanel = ({
  reminders,
  onDismiss,
  onDismissAll,
  onFollowUp,
}) => {
  if (!reminders || reminders.length === 0) return null;

  const isModal = reminders.length >= 3;
  const containerClasses = isModal
    ? 'fixed inset-0 z-50 flex items-center justify-center'
    : 'fixed bottom-6 right-6 z-50';

  return (
    <div className={containerClasses}>
      {/* Fundo desfocado para modal */}
      {isModal && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      )}
      <div
        className={`relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl ${
          isModal 
            ? 'w-full max-w-md m-6 max-h-[70vh]' 
            : 'w-96 max-h-[80vh] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),_0_10px_10px_-5px_rgba(0,0,0,0.2)]'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
          <div className="flex items-center space-x-2">
            <BellRing className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">
              {reminders.length === 1 ? 'Notificação' : `${reminders.length} Notificações`}
            </h2>
          </div>
          <button
            onClick={onDismissAll}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
          >
            Limpar todas
          </button>
        </div>
        
        {/* Lista de notificações */}
        <ScrollArea
          className={isModal ? 'max-h-[55vh]' : 'max-h-80'}
        >
          {reminders.map((rem) => (
            <NotificationItem
              key={rem.id}
              reminder={rem}
              onDismiss={onDismiss}
              onFollowUp={onFollowUp}
            />
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default NotificationsPanel;
