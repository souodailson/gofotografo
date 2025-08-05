import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';

import ProfileSettings from '@/components/settings/ProfileSettings';
import BrandingSettings from '@/components/settings/BrandingSettings';

const initialFormData = {
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
};

const SettingsCategoryCard = ({ title, icon: Icon, children, delay, className }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay }}
      className={`bg-card rounded-xl shadow-lg border border-border ${className}`}
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-customPurple to-customGreen rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">{title}</h2>
        </div>
        <div className="space-y-4 sm:space-y-6">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

const AccountSettings = ({isMobile}) => {
  const { settings, setSettings: saveSettingsToContext, user } = useData();
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialFormData);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeInternalTab, setActiveInternalTab] = useState('profile');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'profile' || tab === 'branding') {
      setActiveInternalTab(tab);
    } else {
      setActiveInternalTab('profile'); 
    }
  }, [location.search]);

  const handleInternalTabChange = (tab) => {
    setActiveInternalTab(tab);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', tab);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...initialFormData,
        ...prev, 
        ...settings,
        user_name: settings.user_name || (user?.user_metadata?.full_name || user?.email || ''),
        contact_email: settings.contact_email || user?.email || '',
        phones: settings.phones && settings.phones.length > 0 ? settings.phones : [{ number: '' }],
        website_social: settings.website_social && settings.website_social.length > 0 ? settings.website_social : [{ type: 'website', url: '' }],
      }));
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        user_name: user?.user_metadata?.full_name || user?.email || '',
        contact_email: user?.email || '',
      }));
    }
  }, [settings, user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (section, index, field, value) => {
    setFormData(prev => {
      const newSectionArray = [...(prev[section] || [])];
      newSectionArray[index] = { ...newSectionArray[index], [field]: value };
      return { ...prev, [section]: newSectionArray };
    });
  };

  const addNestedItem = (section, newItem) => {
    setFormData(prev => ({ ...prev, [section]: [...(prev[section] || []), newItem] }));
  };

  const removeNestedItem = (section, index) => {
    setFormData(prev => ({ ...prev, [section]: (prev[section] || []).filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
    saveSettingsToContext(formData);
    toast({ title: "Configurações da Conta Salvas 💾", description: "Suas informações foram atualizadas com sucesso!" });
  };
  
  const commonProps = { formData, handleInputChange, handleNestedInputChange, addNestedItem, removeNestedItem, toast };

  const SaveButton = () => (
     <Button onClick={handleSave} className="btn-custom-gradient text-white shadow-lg w-full sm:w-auto text-sm sm:text-base">
        <Save className="w-4 h-4 mr-2" />Salvar Alterações
      </Button>
  );

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Minha Conta</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Gerencie suas informações pessoais e da sua marca.</p>
        </motion.div>
        {!isMobile && <SaveButton />}
      </div>

      <div className="flex space-x-1 border-b border-border mb-6">
        <Button
          variant={activeInternalTab === 'profile' ? 'ghost' : 'ghost'}
          onClick={() => handleInternalTabChange('profile')}
          className={`rounded-b-none ${activeInternalTab === 'profile' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
        >
          Perfil
        </Button>
        <Button
          variant={activeInternalTab === 'branding' ? 'ghost' : 'ghost'}
          onClick={() => handleInternalTabChange('branding')}
          className={`rounded-b-none ${activeInternalTab === 'branding' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
        >
          Marca
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeInternalTab}
          initial={{ opacity: 0, x: activeInternalTab === 'profile' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeInternalTab === 'profile' ? 20 : -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeInternalTab === 'profile' && (
            <SettingsCategoryCard title="Informações Pessoais" icon={User} delay={0.1}>
              <ProfileSettings {...commonProps} />
            </SettingsCategoryCard>
          )}
          {activeInternalTab === 'branding' && (
            <SettingsCategoryCard title="Marca e Empresa" icon={Briefcase} delay={0.1}>
              <BrandingSettings {...commonProps} />
            </SettingsCategoryCard>
          )}
        </motion.div>
      </AnimatePresence>

      {isMobile && <div className="mt-8"><SaveButton /></div>}
    </div>
  );
};

export default AccountSettings;