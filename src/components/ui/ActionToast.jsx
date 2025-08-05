import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

const ActionToast = ({ isVisible, title, description, type = 'info', onDismiss }) => {
  if (!isVisible) return null;

  const IconComponent = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-start justify-center pt-20 px-4 bg-black/30 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative max-w-sm w-full bg-card shadow-2xl rounded-lg p-4 flex items-start space-x-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex-shrink-0 ${iconColors[type]}`}>
          <IconComponent className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-card-foreground">{title}</p>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ActionToast;