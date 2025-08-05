import React from 'react';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const AppearanceSettings = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 5 * 0.05 }}
      className="bg-card rounded-xl p-6 shadow-lg border border-border lg:col-span-1"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-customPurple to-customGreen rounded-lg flex items-center justify-center">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-card-foreground">Aparência</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Tema</label>
          <div className="flex items-center space-x-4">
            <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => theme !== 'light' && toggleTheme()} className={`flex items-center space-x-2 ${theme === 'light' ? 'btn-custom-gradient text-white' : ''}`}><span>☀️</span><span>Claro</span></Button>
            <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => theme !== 'dark' && toggleTheme()} className={`flex items-center space-x-2 ${theme === 'dark' ? 'btn-custom-gradient text-white' : ''}`}><span>🌙</span><span>Escuro</span></Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AppearanceSettings;