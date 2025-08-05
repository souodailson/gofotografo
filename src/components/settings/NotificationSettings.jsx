import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const NotificationSettings = ({ formData, handleNotificationChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 4 * 0.05 }}
      className="bg-card rounded-xl p-6 shadow-lg border border-border lg:col-span-1"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-customPurple to-customGreen rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-card-foreground">Notificações</h2>
      </div>
      <div className="space-y-4">
        {['email', 'whatsapp', 'calendar'].map(type => (
          <div key={type} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground capitalize">{type === 'calendar' ? 'Calendário (Google)' : type}</p>
              <p className="text-sm text-muted-foreground">Receber notificações {type === 'calendar' ? 'e sincronizar' : 'por'} {type}</p>
            </div>
            <Checkbox 
              checked={formData.notifications[type]} 
              onCheckedChange={(checked) => handleNotificationChange(type, checked)}
              id={`notif-${type}`}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default NotificationSettings;