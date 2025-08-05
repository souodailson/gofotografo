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
    <div className="flex items-start space-x-2 p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
      <div className={`p-2 rounded-full text-primary-foreground ${color}`}>
        <IconComp className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {reminder.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {reminder.description}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        // No NotificationItem e ReminderItem:
<button
  onClick={() => onFollowUp(reminder)}
  className="p-1"
  title="Follow-up"
>
  <img
    src="https://cdn-icons-png.flaticon.com/512/16566/16566143.png"
    alt="WhatsApp"
    className="w-4 h-4"
  />
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

  const isModal = reminders.length >= 5;
  const containerClasses = isModal
    ? 'fixed inset-0 z-50 flex items-center justify-center'
    : 'fixed bottom-4 right-4 z-50';

  return (
    <div className={containerClasses}>
      {/* Fundo desfocado para modal */}
      {isModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      )}
      <div
        className={`relative bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-lg ${
          isModal ? 'w-full max-w-lg m-4' : 'w-80'
        }`}
      >
        {/* Cabeçalho para modal */}
        {isModal && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <h2 className="font-semibold">
              {reminders.length} Notificações
            </h2>
            <button
              onClick={onDismissAll}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Fechar todas
            </button>
          </div>
        )}
        {/* Lista de notificações */}
        <ScrollArea
          className={isModal ? 'max-h-[70vh]' : 'max-h-96'}
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
