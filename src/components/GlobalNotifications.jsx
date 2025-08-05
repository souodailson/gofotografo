import React from 'react';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';

/**
 * Componente global de notificações.  Escuta eventos de adição de
 * notificação em `window` e mantém uma lista centralizada.  Exibe
 * apenas um painel (ou modal) conforme a quantidade de notificações.
 */
const GlobalNotifications = () => {
  const [notifications, setNotifications] = React.useState([]);
  const lastTimesRef = React.useRef({});

  // Adiciona uma notificação à lista, deduplicando por ID em janela de 5 min
  const addNotification = React.useCallback((reminder) => {
    const now = Date.now();
    const last = lastTimesRef.current[reminder.id] || 0;
    if (now - last > 5 * 60 * 1000) {
      setNotifications((prev) => [...prev, reminder]);
      lastTimesRef.current[reminder.id] = now;
    }
  }, []);

  // Exclui uma notificação individual
  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Exclui todas
  const dismissAll = () => {
    setNotifications([]);
  };

  // Escuta eventos para adicionar notificações (disparados em qualquer lugar)
  React.useEffect(() => {
    const handler = (e) => {
      if (e.detail) {
        addNotification(e.detail);
      }
    };
    window.addEventListener('addNotification', handler);
    return () => {
      window.removeEventListener('addNotification', handler);
    };
  }, [addNotification]);

  if (notifications.length === 0) return null;

  return (
    <NotificationsPanel
      reminders={notifications}
      onDismiss={dismissNotification}
      onDismissAll={dismissAll}
      onFollowUp={(rem) =>
        window.dispatchEvent(
          new CustomEvent('openFollowUp', {
            detail: rem,
          })
        )
      }
    />
  );
};

export default GlobalNotifications;
