import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ActionToast from '@/components/ui/ActionToast';

const ActionToastContext = createContext(null);

export const useActionToast = () => {
  const context = useContext(ActionToastContext);
  if (!context) {
    throw new Error('useActionToast must be used within an ActionToastProvider');
  }
  return context.showToast;
};

export const ActionToastProvider = ({ children }) => {
  const [toastConfig, setToastConfig] = useState(null);

  const showToast = useCallback((config) => {
    setToastConfig({ ...config, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => {
    setToastConfig(null);
  }, []);

  useEffect(() => {
    if (toastConfig) {
      const timer = setTimeout(() => {
        hideToast();
      }, toastConfig.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [toastConfig, hideToast]);

  return (
    <ActionToastContext.Provider value={{ showToast }}>
      {children}
      <ActionToast
        isVisible={!!toastConfig}
        title={toastConfig?.title}
        description={toastConfig?.description}
        type={toastConfig?.type}
        onDismiss={hideToast}
      />
    </ActionToastContext.Provider>
  );
};