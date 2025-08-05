import React from 'react';
import {
  BellRing,
  PhoneOutgoing,
} from 'lucide-react';

/**
 * Exibe uma única notificação inteligente com animação.
 *
 * Props:
 * - reminder: lembrete a ser exibido (ou null).
 * - onClose: callback quando a notificação for fechada (auto ou manual).
 */
const NotificationPopup = ({ reminder, onClose }) => {
  // Toca som no momento em que a notificação é exibida
  React.useEffect(() => {
    if (reminder) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play();
    }
  }, [reminder]);

  if (!reminder) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-80 max-w-sm bg-card/80 backdrop-blur-md border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in duration-300"
    >
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <BellRing className="text-yellow-500 w-5 h-5" />
          <span className="font-semibold">
            {reminder.title}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Fechar
        </button>
      </div>
      <div className="p-3 space-y-2">
        <p className="text-sm text-muted-foreground">
          {reminder.description}
        </p>
        {/* Botão de follow-up sempre visível */}
        <div className="flex justify-end">
          <button
            onClick={() =>
              reminder.onFollowUp &&
              reminder.onFollowUp(reminder)
            }
            className="text-green-600 hover:text-green-700 flex items-center space-x-1 text-sm"
          >
            <PhoneOutgoing size={16} />
            <span>Follow‑up</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
