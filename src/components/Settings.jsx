import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Palette, Settings as SettingsIconLucide, Bell, Shield, AlertTriangle, Blocks, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { exchangeCodeForTokens } from '@/lib/googleCalendar';

import AccountPreferencesSettings from '@/components/settings/AccountPreferencesSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import TeamSettings from '@/components/settings/TeamSettings';
import AutomationSettings from '@/components/settings/AutomationSettings';
import AccountManagementSettings from '@/components/settings/AccountManagementSettings';
import IntegrationsSettings from '@/components/settings/IntegrationsSettings';
import SupportSettings from '@/components/settings/SupportSettings';
import useMobileLayout from '@/hooks/useMobileLayout';

const initialSettingsFormFields = {
  language: 'pt-BR',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  date_format: 'dd/mm/yyyy',
  notifications: { email: true, whatsapp: true, calendar: true },
  automation: {
    session_reminder: false,
    payment_reminder: false,
    meeting_reminder: false,
    pre_event_sequence: false,
    post_event_sequence: false,
  },
  user_name: '',
  business_name: '',
  photography_type: '',
  cnpj: '',
  cpf: '',
  phones: [{ number: '' }],
  contact_email: '',
  website_social: [{ type: 'website', url: '' }],
  address: '',
  profile_photo: null,
  logo: null,
  subdomain: '',
  hide_dashboard_balances: false,
  workflow_columns: null, 
  google_calendar_credentials: null,
  show_greetings: true,
};

const SettingsCategoryCard = ({ title, icon: Icon, children, delay, className }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay }}
      className={`bg-card rounded-xl shadow-lg border border-border ${className}`}
    >
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-customPurple to-customGreen rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
        </div>
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </motion.div>
  );
};


const Settings = ({isMobile: propIsMobile, updateUrl}) => {
  const { settings, setSettings: saveSettingsToContext, user } = useData();
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialSettingsFormFields);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeInternalTab, setActiveInternalTab] = useState('preferences');
  const { isMobile } = useMobileLayout();

  const handleGoogleCallback = useCallback(async (code) => {
    try {
      const { tokens, error } = await exchangeCodeForTokens(code);
      if (error) {
        throw new Error(error);
      }
      
      const updatedSettings = { ...settings, google_calendar_credentials: tokens };
      await saveSettingsToContext(updatedSettings);

      toast({
        title: "Google Calendar Conectado!",
        description: "Sua conta foi autenticada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na autenticação",
        description: `Não foi possível conectar com o Google Calendar: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      navigate('/settings?tab=integrations', { replace: true });
    }
  }, [settings, saveSettingsToContext, toast, navigate]);


  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const tab = searchParams.get('tab') || 'preferences';
    
    if (code) {
      handleGoogleCallback(code);
    }

    if (['preferences', 'functionalities', 'integrations', 'security', 'dataManagement', 'support'].includes(tab)) {
      setActiveInternalTab(tab);
    } else {
      setActiveInternalTab('preferences');
    }
  }, [location.search, handleGoogleCallback]);

  const handleInternalTabChange = (tab) => {
    setActiveInternalTab(tab);
    navigate(`/settings?tab=${tab}`, { replace: true });
  };

  useEffect(() => {
    if (settings) {
      const currentFormFields = {};
      for (const key in initialSettingsFormFields) {
        if (settings.hasOwnProperty(key)) {
          if (key === 'show_greetings') {
             currentFormFields[key] = settings[key] === null || settings[key] === undefined ? true : settings[key];
          } else if (typeof initialSettingsFormFields[key] === 'object' && initialSettingsFormFields[key] !== null && !Array.isArray(initialSettingsFormFields[key])) {
             currentFormFields[key] = { ...initialSettingsFormFields[key], ...settings[key] };
          } else {
            currentFormFields[key] = settings[key];
          }
        } else {
          currentFormFields[key] = initialSettingsFormFields[key];
        }
      }
      if (!currentFormFields.user_name && user?.user_metadata?.full_name) {
        currentFormFields.user_name = user.user_metadata.full_name;
      }
      if (!currentFormFields.contact_email && user?.email) {
        currentFormFields.contact_email = user.email;
      }

      setFormData(currentFormFields);
    }
  }, [settings, user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setFormData(prev => ({ ...prev, notifications: { ...prev.notifications, [field]: value } }));
  };
  
  const handleAutomationChange = (field, value) => {
    setFormData(prev => ({ ...prev, automation: { ...(prev.automation || initialSettingsFormFields.automation), [field]: value } }));
  };

  const handleSave = () => {
    const settingsToUpdate = { ...formData };
    
    settingsToUpdate.show_greetings = formData.show_greetings;

    delete settingsToUpdate.google_calendar_credentials;
    
    saveSettingsToContext(settingsToUpdate);
    toast({ title: "Configurações salvas 💾", description: "Suas configurações foram atualizadas com sucesso!" });
  };
  
  const commonProps = { formData, handleInputChange, toast };
  const notificationProps = {...commonProps, handleNotificationChange};
  const automationProps = {...commonProps, handleAutomationChange};

  const SaveButton = () => (
    <Button onClick={handleSave} className="btn-custom-gradient text-white shadow-lg w-full sm:w-auto">
      <Save className="w-4 h-4 mr-2" />Salvar Alterações
    </Button>
  );

  const renderTabContent = () => {
    switch (activeInternalTab) {
      case 'preferences':
        return (
          <SettingsCategoryCard title="Preferências e Aparência" icon={Palette} delay={0.1}>
            <AccountPreferencesSettings {...commonProps} formData={formData} handleInputChange={handleInputChange} />
            <AppearanceSettings />
          </SettingsCategoryCard>
        );
      case 'functionalities':
        return (
          <SettingsCategoryCard title="Funcionalidades do Sistema" icon={SettingsIconLucide} delay={0.2}>
            <NotificationSettings {...notificationProps} formData={formData} />
            <AutomationSettings {...automationProps} formData={formData} />
            <TeamSettings {...commonProps} formData={formData} />
          </SettingsCategoryCard>
        );
      case 'integrations':
        return (
          <SettingsCategoryCard title="Integrações" icon={Blocks} delay={0.3}>
            <IntegrationsSettings {...commonProps} />
          </SettingsCategoryCard>
        );
      case 'security':
        return (
          <SettingsCategoryCard title="Segurança da Conta" icon={Shield} delay={0.4}>
            <SecuritySettings {...commonProps} />
          </SettingsCategoryCard>
        );
      case 'dataManagement':
        return (
          <SettingsCategoryCard title="Gerenciamento de Dados" icon={AlertTriangle} delay={0.5}>
             <AccountManagementSettings {...commonProps} />
          </SettingsCategoryCard>
        );
      case 'support':
        return (
          <SupportSettings />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={isMobile ? "hidden" : ""}>
          <h1 className="text-3xl font-bold text-foreground">Configurações do Sistema</h1>
          <p className="text-muted-foreground mt-1">Ajuste suas preferências e funcionalidades.</p>
        </motion.div>
        {!isMobile && <SaveButton />}
      </div>

      <div className="flex space-x-1 border-b border-border mb-6 overflow-x-auto scrollbar-thin pb-px">
        {[
          { id: 'preferences', label: 'Preferências', icon: Palette },
          { id: 'functionalities', label: 'Funcionalidades', icon: SettingsIconLucide },
          { id: 'integrations', label: 'Integrações', icon: Blocks },
          { id: 'security', label: 'Segurança', icon: Shield },
          { id: 'dataManagement', label: 'Dados', icon: AlertTriangle },
          { id: 'support', label: 'Suporte', icon: LifeBuoy },
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeInternalTab === tab.id ? 'default' : 'ghost'}
            onClick={() => handleInternalTabChange(tab.id)}
            className={`rounded-b-none whitespace-nowrap px-3 py-2 h-auto sm:px-4 ${activeInternalTab === tab.id ? 'bg-primary/5 text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
          >
            <tab.icon className={`w-4 h-4 ${isMobile ? '' : 'mr-2'}`} />
            {!isMobile && tab.label}
          </Button>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeInternalTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      {isMobile && <div className="mt-8"><SaveButton /></div>}
    </div>
  );
};

export default Settings;