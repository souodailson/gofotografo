import React from 'react';
import { motion } from 'framer-motion';
import { Globe, MessageSquare, ToggleLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const selectBaseClasses = "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-customPurple focus:border-transparent";

const renderSelect = (label, id, value, onChange, options, placeholder = 'Selecione...') => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
    <select id={id} value={value || ''} onChange={e => onChange(e.target.value)} className={selectBaseClasses}>
      <option value="" disabled>{placeholder}</option>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const AccountPreferencesSettings = ({ formData, handleInputChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 * 0.05 }}
      className="bg-card rounded-xl p-6 shadow-lg border border-border lg:col-span-1"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-customPurple to-customGreen rounded-lg flex items-center justify-center">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-card-foreground">Preferências da Conta</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSelect('Idioma', 'language', formData.language, (val) => handleInputChange('language', val), [{label: 'Português (Brasil)', value: 'pt-BR'}, {label: 'English (US)', value: 'en-US'}], 'Selecione o Idioma')}
        {renderSelect('Moeda Padrão', 'currency', formData.currency, (val) => handleInputChange('currency', val), [{label: 'Real Brasileiro (R$)', value: 'BRL'}, {label: 'Dólar Americano ($)', value: 'USD'}, {label: 'Euro (€)', value: 'EUR'}], 'Selecione a Moeda')}
        {renderSelect('Fuso Horário', 'timezone', formData.timezone, (val) => handleInputChange('timezone', val), [
          {label: 'Brasília (GMT-3)', value: 'America/Sao_Paulo'}, 
          {label: 'Nova York (GMT-4/-5)', value: 'America/New_York'},
          {label: 'Londres (GMT+0/+1)', value: 'Europe/London'}
        ], 'Selecione seu fuso horário')}
        {renderSelect('Formato de Data', 'date_format', formData.date_format, (val) => handleInputChange('date_format', val), [{label: 'DD/MM/AAAA', value: 'dd/mm/yyyy'}, {label: 'MM/DD/AAAA', value: 'mm/dd/yyyy'}], 'Selecione o Formato de Data')}
        
        <div className="md:col-span-2 border-t border-border pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="show-greetings" className="font-medium text-card-foreground flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-customPurple" />
                        Exibir Saudações Iniciais
                    </Label>
                    <p className="text-sm text-muted-foreground">Mostrar saudações criativas no topo do dashboard.</p>
                </div>
                <Switch
                    id="show-greetings"
                    checked={formData.show_greetings}
                    onCheckedChange={(checked) => handleInputChange('show_greetings', checked)}
                />
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountPreferencesSettings;